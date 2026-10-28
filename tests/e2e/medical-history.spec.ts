import { test, expect, Page } from "@playwright/test";

test("clinical inputs accept units, reject invalid values and reload canonical measurements", async ({page}) => {
  const state=await setup(page);
  await page.getByRole('button',{name:'Examen Clínico',exact:true}).click();
  await page.getByRole('textbox',{name:'Peso',exact:true}).fill('80cm');
  await page.getByRole('button',{name:'Guardar',exact:true}).first().click();
  await expect(page.getByText(/Peso: ingresá un número en kg/).first()).toBeVisible();
  expect(state.writes).toHaveLength(0);
  for(const [label,value] of [['Talla','175cm'],['Peso','80kg'],['Saturación','99%'],['IMC','20,15'],['TA: mínima','80mmhg'],['TA: máxima','120mmHg']]) {
    await page.getByRole('textbox',{name:label,exact:true}).fill(value);
  }
  await page.getByRole('button',{name:'Guardar',exact:true}).first().click();
  await expect.poll(()=>state.writes.length).toBe(1);
  expect(state.saved().medical_record_clinical_exam).toMatchObject({talla:175,peso:80,saturacion:99,imc:20.15,ta_min:80,ta_max:120});
  await page.reload();
  await expect(page.getByPlaceholder('Nombre completo')).toHaveValue('Paciente ficticio');
  await page.getByRole('button',{name:'Examen Clínico',exact:true}).click();
  await expect(page.getByRole('textbox',{name:'IMC',exact:true})).toHaveValue('20.15');
  await expect(page.getByRole('textbox',{name:'Talla',exact:true})).toHaveValue('175');
});

const patient = "hc-test-patient";
async function setup(page: Page, failure = 0) {
  let saved: Record<string, any> = {
    id: "hc-test-record",
    patient_id: patient,
    medical_record_data: {
      complete_name: "Paciente ficticio",
      age: "35",
      education_level: null,
      sector: "Sector ficticio",
    },
    medical_record_surgerys: { others: true, others_description: "Cesáreas" },
    medical_record_cuestionario_riesgos: { complete_name: "LEGACY_RISK" },
  };
  const writes: Record<string, any>[] = [];
  await page.route("**/*", async (route) => {
    const request = route.request(),
      url = new URL(request.url());
    if (url.origin === "http://127.0.0.1:3107") return route.continue();
    if (url.origin !== "http://127.0.0.1:8000") return route.abort();
    const headers = {
      "access-control-allow-origin": "http://127.0.0.1:3107",
      "access-control-allow-credentials": "true",
      "access-control-allow-headers": "*",
      "access-control-allow-methods": "GET,POST,PUT,OPTIONS",
    };
    const reply = (body: unknown, status = 200) =>
      route.fulfill({
        status,
        headers,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    if (request.method() === "OPTIONS") return reply({});
    if (request.method() === "GET" && url.pathname === "/verify-token")
      return reply({ valid: true });
    if (request.method() === "GET" && url.pathname === "/me")
      return reply({
        user: {
          id: "hc-test-admin",
          role: "admin",
          is_active: true,
          email: "qa@example.invalid",
        },
        profile: {},
      });
    if (request.method() === "GET" && url.pathname === "/patients/getPatients")
      return reply([
        {
          id: patient,
          company_id: "company-test",
          company_name: "Empresa ficticia",
        },
      ]);
    if (
      request.method() === "GET" &&
      url.pathname === `/medical-records/patient/${patient}`
    )
      return reply([saved]);
    if (
      request.method() === "PUT" &&
      url.pathname === "/medical-records/hc-test-record"
    ) {
      const form = await new Response(
        new Uint8Array(request.postDataBuffer()!),
        { headers: { "content-type": request.headers()["content-type"] } },
      ).formData();
      const payload = JSON.parse(String(form.get("data")));
      writes.push(payload);
      if (failure)
        return reply(
          {
            detail: {
              code: "medical_record_schema_outdated",
              message: "Falta actualizar el esquema",
            },
          },
          failure,
        );
      saved = { ...saved, ...payload };
      return reply(saved);
    }
    throw new Error(
      `API request without a test fixture: ${request.method()} ${url.pathname}`,
    );
  });
  await page.goto(`/system/medical-history/${patient}`);
  await expect(page.getByPlaceholder("Nombre completo")).toHaveValue(
    "Paciente ficticio",
  );
  return { writes, saved: () => saved };
}

test("other surgery, optional education and age survive saving and reopening", async ({
  page,
}) => {
  const state = await setup(page);
  await expect(
    page.getByText("Cuestionario para trabajadores", { exact: false }),
  ).toHaveCount(0);
  await page.getByLabel("Edad", { exact: true }).fill("28 años");
  await page
    .getByRole("combobox", { name: "Estudios", exact: true })
    .selectOption("");
  await page
    .getByLabel("Sector", { exact: true })
    .fill("Mantenimiento ficticio");
  await page.getByRole("button", { name: "Ha sido operado/a de:" }).click();
  await expect(page.getByPlaceholder("Describa la cirugía")).toHaveValue(
    "Cesáreas",
  );
  await page
    .getByPlaceholder("Describa la cirugía")
    .fill("Cesáreas y cirugía ficticia");
  await page
    .getByRole("button", { name: "Guardar", exact: true })
    .first()
    .click();
  await expect.poll(() => state.writes.length).toBe(1);
  expect(state.saved().medical_record_data.age).toBe("28");
  expect(state.saved().medical_record_data.education_level).toBeNull();
  expect(state.saved().medical_record_surgerys.others_description).toBe(
    "Cesáreas y cirugía ficticia",
  );
  await page.reload();
  await expect(page.getByLabel("Edad", { exact: true })).toHaveValue("28 años");
  await page.getByRole("button", { name: "Ha sido operado/a de:" }).click();
  await expect(page.getByPlaceholder("Describa la cirugía")).toHaveValue(
    "Cesáreas y cirugía ficticia",
  );
});

test("failed saves preserve input and stay on the HC", async ({ page }) => {
  const state = await setup(page, 503);
  await page.getByLabel("Sector", { exact: true }).fill("CONSERVAR ESTE DATO");
  await page
    .getByRole("button", { name: "Guardar", exact: true })
    .first()
    .click();
  await expect.poll(() => state.writes.length).toBe(1);
  await expect(
    page.getByText(/Los datos ingresados se conservaron/).first(),
  ).toBeVisible();
  await expect(page.getByLabel("Sector", { exact: true })).toHaveValue(
    "CONSERVAR ESTE DATO",
  );
  await expect(page).toHaveURL(new RegExp(`/medical-history/${patient}$`));
});

test("age rejects out-of-range and nonnumeric input; education fits the viewport", async ({
  page,
}) => {
  const state = await setup(page);
  const age = page.getByLabel("Edad", { exact: true });
  for (const invalid of ["0", "151", "-1", "abc", "1.5"]) {
    await age.fill(invalid);
    await page.getByRole("button", {name:"Guardar", exact:true}).first().click();
    await expect(page.getByText(/Ingresá una edad entre 1 y 150/).first()).toBeVisible();
    await expect(age).toHaveValue(invalid);
    expect(state.writes).toHaveLength(0);
  }
  const studies = page.getByRole("combobox", { name: "Estudios", exact: true });
  const box = await studies.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
});

test("printing current unsaved input generates a PDF without saving", async ({
  page,
}, info) => {
  const state = await setup(page);
  await page.evaluate(() => {
    window.open = ((url: string | URL | undefined) => {
      (window as any).__hcPrintedURL = String(url);
      return null;
    }) as typeof window.open;
  });
  await page.getByRole("button", { name: "Ha sido operado/a de:" }).click();
  await page
    .getByPlaceholder("Describa la cirugía")
    .fill("Cirugía ficticia aún sin guardar");
  await page.getByRole("button", { name: "Imprimir", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__hcPrintedURL), {
      timeout: 30000,
    })
    .toMatch(/^blob:/);
  const bytes = await page.evaluate(async () =>
    Array.from(
      new Uint8Array(
        await (await fetch((window as any).__hcPrintedURL)).arrayBuffer(),
      ),
    ),
  );
  const buffer = Buffer.from(bytes);
  expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
  expect(state.writes).toHaveLength(0);
  await info.attach("hc-browser.pdf", {
    body: buffer,
    contentType: "application/pdf",
  });
});
