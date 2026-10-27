# Verificación de historia clínica

## Preparación (una sola vez)

Desde `vitalis-website`, instalar las dependencias del proyecto con `pnpm install` y el navegador de pruebas con `pnpm exec playwright install chromium`.
El backend debe estar junto al frontend, en `../backend-vitalis`, con sus dependencias y el entorno `venv` habitual.

## Suite completa de ambos repositorios

```powershell
npm run test:hc:all
```

También se pueden ejecutar por separado:

```powershell
npm run test:hc:unit
npm run test:hc:web
npm run test:hc:audit
```

La suite usa pacientes ficticios, una API interceptada en Playwright y SQLite en memoria para los handlers del backend. No necesita login real ni una base MySQL. Playwright inicia su propio frontend en `127.0.0.1:3107`, fuerza una URL de API local, simula autenticación y bloquea las solicitudes del navegador a otros servidores. No reutiliza un servidor que ya esté corriendo. El puerto debe estar libre.

## Qué verifica

- Creación, actualización y relectura HTTP de todas las secciones y campos de los modelos clínicos; booleanos afirmativos y negativos, campos vacíos y datos conservados tras errores. Las tablas y archivos de prueba se descartan al terminar.
- En Chromium, con escritorio y pantalla móvil: edad como string, límites de edad, estudios opcionales, selector dentro del ancho de pantalla, sector y detalle de otras cirugías, guardar/reabrir y conservar datos después de un error 503.
- El árbol del componente real de impresión y la generación de PDF con `@react-pdf/renderer`: cuestionario de riesgo excluido aun con respuestas antiguas, firmas conservadas, otras cirugías con textos cortos y largos, empresa y datos personales.
- Auditoría automática de cada campo literal del formulario: cambia su valor individualmente y exige un cambio en el componente de impresión. Si un campo queda fuera, el proceso falla y lo identifica en `test-results/hc-print-coverage.json`. El inventario se obtiene de los tipos y componentes actuales; no contiene una lista de omisiones permitidas.

## PDF para revisión visual

```powershell
$env:HC_PDF_OUTPUT = "$PWD\test-results\pdf"
npm run test:hc:unit
npm run test:hc:audit
Remove-Item Env:HC_PDF_OUTPUT
```

Revisar `hc-surgery.pdf`, `hc-long.pdf` y `hc-coverage.pdf`. Este último incluye todos los campos auditados con valores ficticios. Los resultados y las trazas no se versionan.

## Alcance

La suite separa las pruebas del navegador con API simulada de las pruebas HTTP reales del backend con SQLite. No es una prueba contra una instalación desplegada ni comprueba las migraciones o tipos reales de MySQL; para eso existe el chequeo de esquema del backend. La auditoría detecta que un campo afecta la impresión, pero no demuestra por sí sola que su rótulo o posición sean correctos; tampoco descubre nombres construidos dinámicamente que no aparezcan como literales. Revisar visualmente cuando se cambia el PDF. Firmas dibujadas, carga real de archivos y todos los permisos de usuario requieren pruebas específicas adicionales.
