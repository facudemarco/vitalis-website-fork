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
async function protectedDraft(page: Page, userId = "hc-test-admin") {
  return page.evaluate(async ({userId, patient}) => {
    if (!(await indexedDB.databases()).some(db => db.name === "vitalis-protected-medical-drafts")) return null;
    const db = await new Promise<IDBDatabase>((resolve,reject) => {
      const request=indexedDB.open("vitalis-protected-medical-drafts",1);
      request.onsuccess=()=>resolve(request.result); request.onerror=()=>reject(request.error);
    });
    const read=(request: IDBRequest<any>)=>new Promise<any>((resolve,reject)=>{request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
    try {
      const stored=await read(db.transaction("drafts").objectStore("drafts").get(JSON.stringify([userId,patient])));
      if (!stored) return null;
      const key=await read(db.transaction("keys").objectStore("keys").get(userId));
      const bytes=await crypto.subtle.decrypt({name:"AES-GCM",iv:stored.iv,additionalData:new TextEncoder().encode(`v1:${JSON.stringify([userId,patient])}`)},key.key,stored.encrypted);
      return {...JSON.parse(new TextDecoder().decode(bytes)), revision:stored.revision, keyExtractable:key.key.extractable,
        ciphertext:new TextDecoder().decode(stored.encrypted)};
    } finally {db.close();}
  },{userId,patient});
}

test("expired sessions reauthenticate in place with the same account and preserve the ficha",async({page})=>{
  const state=await setup(page);
  await page.getByLabel("Sector",{exact:true}).fill("CONSERVAR TRAS VENCIMIENTO");
  state.expire();
  await page.getByRole("button",{name:"Guardar",exact:true}).first().click();
  await expect(page.getByRole("region",{name:"Sesión de la ficha"})).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/medical-history/${patient}$`));
  await expect(page.getByLabel("Sector",{exact:true})).toHaveValue("CONSERVAR TRAS VENCIMIENTO");
  expect(state.writes).toHaveLength(0);
  await page.getByLabel("Correo de tu cuenta").fill("another@example.invalid");
  await page.getByLabel("Contraseña",{exact:true}).fill("test-only");
  await page.getByRole("button",{name:"Volver a ingresar sin salir de la ficha"}).click();
  await expect(page.getByText("Ingresá con la misma cuenta con la que abriste esta ficha.")).toBeVisible();
  await page.getByLabel("Correo de tu cuenta").fill("qa@example.invalid");
  await page.getByRole("button",{name:"Volver a ingresar sin salir de la ficha"}).click();
  await expect(page.getByRole("button",{name:"Volver a ingresar sin salir de la ficha"})).toHaveCount(0);
  await page.getByRole("button",{name:"Guardar",exact:true}).first().click();
  await expect.poll(()=>state.writes.length).toBe(1);
  expect(state.saved().medical_record_data.sector).toBe("CONSERVAR TRAS VENCIMIENTO");
});

test("six hours are counted from opening the ficha without discarding work at expiry",async({page})=>{
  await page.clock.install({time:new Date()});
  const state=await setup(page);
  await page.getByLabel("Sector",{exact:true}).fill("SEIS HORAS DE TRABAJO");
  await page.clock.fastForward(359*60000);
  await expect(page.getByText(/Queda 1 minuto de sesión/)).toBeVisible();
  await page.clock.fastForward(61000);
  await expect(page.getByText("La sesión venció. La ficha sigue abierta y conserva tus cambios.")).toBeVisible();
  await expect(page.getByLabel("Sector",{exact:true})).toHaveValue("SEIS HORAS DE TRABAJO");
  await page.getByRole("button",{name:"Guardar",exact:true}).first().click();
  expect(state.writes).toHaveLength(0);
});

test("encrypted drafts recover text, photo and pending signature after closing a tab",async({page,context})=>{
  await setup(page);
  await page.getByLabel("Sector",{exact:true}).fill("BORRADOR CLINICO FICTICIO");
  const {photoFixture}=require('../helpers/photo-fixture.cjs');
  const bytes=Buffer.from(photoFixture(64,40).split(',')[1],'base64');
  await page.locator('input[type="file"]').first().setInputFiles({name:"foto-ficticia.png",mimeType:"image/png",buffer:bytes});
  await page.getByRole("button",{name:/Firma Digital y Matrícula/}).click();
  const canvas=page.locator('canvas:visible').first();
  await canvas.scrollIntoViewIfNeeded();
  const box=await canvas.boundingBox(); expect(box).not.toBeNull();
  await page.mouse.move(box!.x+10,box!.y+25);await page.mouse.down();
  await page.mouse.move(box!.x+70,box!.y+50,{steps:8});await page.mouse.up();
  await expect.poll(async()=>Boolean((await protectedDraft(page))?.files?.evaluator)).toBe(true);
  const stored=await protectedDraft(page);
  expect(stored.record.medical_record_data.sector).toBe("BORRADOR CLINICO FICTICIO");
  expect(stored.files.photo.name).toBe("foto-ficticia.png");
  expect(stored.keyExtractable).toBe(false);
  expect(stored.ciphertext).not.toContain("BORRADOR CLINICO FICTICIO");
  await page.close();
  const reopened=await context.newPage();
  const state=await setup(reopened,0,{expectDraft:true});
  await reopened.getByRole("button",{name:"Recuperar borrador",exact:true}).click();
  await expect(reopened.getByLabel("Sector",{exact:true})).toHaveValue("BORRADOR CLINICO FICTICIO");
  await expect(reopened.locator('img[src^="blob:"]').first()).toBeVisible();
  await reopened.getByRole("button",{name:/Firma Digital y Matrícula/}).click();
  await expect.poll(async()=>reopened.locator('canvas:visible').first().evaluate((element:HTMLCanvasElement)=>
    element.getContext('2d')!.getImageData(0,0,element.width,element.height).data.some((value,index)=>index%4===3&&value>0))).toBe(true);
  await reopened.getByRole("button",{name:"Guardar",exact:true}).first().click();
  await expect.poll(()=>state.writes.length).toBe(1);
  expect(state.uploads[0]).toEqual(expect.arrayContaining(["data_img","firma_medico_evaluador"]));
  await expect.poll(()=>protectedDraft(reopened)).toBeNull();
});

test("a different account cannot save or recover another user's draft",async({page})=>{
  const state=await setup(page);
  await page.getByLabel("Sector",{exact:true}).fill("PRIVADO DE LA CUENTA ORIGINAL");
  await expect.poll(async()=>(await protectedDraft(page))?.record.medical_record_data.sector).toBe("PRIVADO DE LA CUENTA ORIGINAL");
  state.changeUser();
  await page.getByRole("button",{name:"Guardar",exact:true}).first().click();
  await expect(page.getByRole("button",{name:"Volver a ingresar sin salir de la ficha"})).toBeVisible();
  expect(state.writes).toHaveLength(0);
  await page.reload();
  await expect(page.getByPlaceholder("Nombre completo")).toHaveValue("Paciente ficticio");
  await expect(page.getByRole("button",{name:"Recuperar borrador",exact:true})).toHaveCount(0);
  await expect(page.getByLabel("Sector",{exact:true})).toHaveValue("Sector ficticio");
  expect(await protectedDraft(page,"different-user")).toBeNull();
});

test("a failed HC read never displays an editable empty replacement",async({page})=>{
  await setup(page,0,{loadFailure:true});
  await expect(page.getByText(/No se pudo cargar la ficha/)).toBeVisible();
  await expect(page.getByPlaceholder("Nombre completo")).toHaveCount(0);
  await expect(page.getByRole("button",{name:"Reintentar carga"})).toBeVisible();
});

test("draft storage errors keep editing and explicit server save available",async({page})=>{
  const state=await setup(page);
  await page.evaluate(()=>{indexedDB.open=()=>{throw new DOMException("Storage unavailable","SecurityError");};});
  await page.getByLabel("Sector",{exact:true}).fill("GUARDAR AUN SIN ALMACENAMIENTO LOCAL");
  await expect(page.getByText(/No pudimos guardar el borrador en este navegador/)).toBeVisible();
  await page.getByRole("button",{name:"Guardar",exact:true}).first().click();
  await expect.poll(()=>state.writes.length).toBe(1);
  expect(state.saved().medical_record_data.sector).toBe("GUARDAR AUN SIN ALMACENAMIENTO LOCAL");
});

test("expired local drafts are removed rather than restored",async({page})=>{
  await setup(page);
  await page.getByLabel("Sector",{exact:true}).fill("BORRADOR VENCIDO");
  await expect.poll(async()=>(await protectedDraft(page))?.record.medical_record_data.sector).toBe("BORRADOR VENCIDO");
  await page.evaluate(async()=>{
    const db=await new Promise<IDBDatabase>(resolve=>{const request=indexedDB.open("vitalis-protected-medical-drafts",1);request.onsuccess=()=>resolve(request.result);});
    const tx=db.transaction("drafts","readwrite"),store=tx.objectStore("drafts");
    const request=store.get(JSON.stringify(["hc-test-admin","hc-test-patient"]));
    request.onsuccess=()=>store.put({...request.result,expiresAt:Date.now()-1});
    await new Promise<void>((resolve,reject)=>{tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});db.close();
  });
  await page.reload();
  await expect(page.getByLabel("Sector",{exact:true})).toHaveValue("Sector ficticio");
  expect(await protectedDraft(page)).toBeNull();
});

test("logout clears protected drafts and stops another open tab from recreating them",async({page,context})=>{
  await page.clock.install({time:new Date()});
  await setup(page);
  await page.getByLabel("Sector",{exact:true}).fill("BORRAR AL CERRAR SESION");
  await page.clock.fastForward(1000);
  await expect.poll(async()=>(await protectedDraft(page))?.record.medical_record_data.sector).toBe("BORRAR AL CERRAR SESION");
  const portal=await context.newPage();
  await setup(portal,0,{expectDraft:true});
  // Execute the same logout cleanup used by AuthContext in a second tab.
  // This isolates draft protection from unrelated portal navigation.
  const ts=require('typescript');
  const source=require('node:fs').readFileSync(require('node:path').resolve('src/lib/medicalDrafts.ts'),'utf8');
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  await portal.evaluate(async(code:string)=>{
    const moduleExports: Record<string,any>={};
    new Function('exports',code)(moduleExports);
    await moduleExports.clearUserMedicalDrafts('hc-test-admin');
  },compiled);
  await expect.poll(()=>protectedDraft(page)).toBeNull();
  await expect(page.getByRole("button",{name:"Volver a ingresar sin salir de la ficha"})).toBeVisible();
  await page.getByLabel("Sector",{exact:true}).fill("SIGUE EN PANTALLA SIN RECREAR BORRADOR");
  await page.clock.fastForward(2000);
  expect(await protectedDraft(page)).toBeNull();
});
async function setup(page: Page, failure = 0, options: {loadFailure?: boolean; expectDraft?: boolean} = {}) {
  page.on("dialog", dialog => dialog.accept());
  let valid = true, currentUser = "hc-test-admin", saveFailure = failure;
  let expires = Math.floor(Date.now() / 1000) + 21600;
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
  const uploads: string[][] = [];
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
      return reply({ valid, payload: valid ? {id:currentUser, exp:expires} : undefined });
    if (request.method() === "POST" && url.pathname.startsWith(`/medical-session/${patient}`)) {
      expect(request.headers()["content-type"]).toContain("application/x-www-form-urlencoded");
      const body = new URLSearchParams(request.postData() || "");
      if (url.pathname.endsWith("/reauthenticate")) {
        if (body.get("password") !== "test-only") return reply({detail:"Correo o contraseña incorrectos."},401);
        if (body.get("email") !== "qa@example.invalid") return reply({detail:"Ingresá con la misma cuenta con la que abriste esta ficha."},409);
        valid = true; saveFailure = 0; currentUser = "hc-test-admin";
      }
      if (!valid) return reply({detail:"Invalid token"},401);
      expires = Math.floor(Date.now() / 1000) + 21600;
      return reply({user_id:currentUser,expires_at:expires});
    }
    if (request.method() === "POST" && url.pathname === "/logout") return reply({detail:"Logged out successfully"});
    if (request.method() === "GET" && url.pathname === "/companies/") return reply([]);
    if (request.method() === "GET" && url.pathname === "/me")
      return valid ? reply({
        user: {
          id: currentUser,
          role: "admin",
          is_active: true,
          email: "qa@example.invalid",
        },
        profile: {},
      }) : reply({detail:"Invalid token"},401);
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
      return options.loadFailure ? reply({detail:"temporary error"},503) : reply([saved]);
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
      uploads.push([...form.entries()].filter(([,value]) => typeof value !== "string").map(([name]) => name));
      if (saveFailure) {
        if (saveFailure === 401) valid = false;
        return reply(
          {
            detail: {
              code: "medical_record_schema_outdated",
              message: "Falta actualizar el esquema",
            },
          },
          saveFailure,
        );
      }
      saved = { ...saved, ...payload };
      return reply(saved);
    }
    throw new Error(
      `API request without a test fixture: ${request.method()} ${url.pathname}`,
    );
  });
  await page.goto(`/system/medical-history/${patient}`);
  if (options.expectDraft) await expect(page.getByRole("heading",{name:"Hay un borrador sin guardar de esta ficha"})).toBeVisible({timeout:15000});
  else if (!options.loadFailure) await expect(page.getByPlaceholder("Nombre completo")).toHaveValue("Paciente ficticio",{timeout:15000});
  return { writes, uploads, saved: () => saved, expire: () => {valid=false;}, changeUser: () => {currentUser="different-user";} };
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
