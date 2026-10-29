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


## Medidas clínicas y fotos

Las medidas aceptan el número solo o con su unidad: talla en cm, peso en kg, saturación en %, TA mínima/máxima en mmHg. Se admiten punto o coma decimal y unidades sin distinguir mayúsculas. El IMC acepta un entero o hasta dos decimales. Las columnas numéricas existentes conservan los valores; la unidad es fija por campo y se agrega al imprimir. No se requiere migración. No se convierten automáticamente otras unidades como metros o libras.

Las pruebas cubren unidades equivocadas, entradas inválidas, valores vacíos, datos numéricos anteriores y guardado/relectura. La casilla de examen físico se verifica dentro de estudios realizados. Al generar PDFs de QA se agregan hc-photo-landscape.pdf, hc-photo-portrait.pdf, hc-photo-square.pdf y hc-photo-panorama.pdf: imágenes ficticias de cuatro colores para detectar recortes o deformación. El encuadre conserva la imagen completa con objectFit contain; los márgenes dependen de la proporción de la foto.


## Edad con unidad

Edad acepta `28 años`, `1 año` y el número solo, con rango entero de 1 a 150. El formulario y el PDF muestran año/años; la API normaliza a una cadena numérica compatible con VARCHAR(3), sin otra migración. Las pruebas cubren el sufijo, mayúsculas, límites, guardado y reapertura.


## Sesiones de seis horas y recuperación

- Login, apertura de ficha autorizada y reingreso emiten un token de 360 minutos con una cookie HttpOnly/Secure del mismo plazo. Cada apertura de ficha inicia una ventana nueva de seis horas para el editor. Escribir, guardar borradores o hacer consultas no renueva automáticamente esa ventana.
- Quince minutos antes del vencimiento aparece un aviso. Si vence, se mantienen el formulario, la foto y las firmas. Se puede reingresar con la misma cuenta desde la propia ficha y volver a usar Guardar. Una cuenta distinta se rechaza antes de cambiar la cookie; el guardado también comprueba el identificador del editor para detectar cambios de cuenta entre pestañas.
- En una HC abierta, cualquier 401 conserva la pantalla. Fuera de la HC se mantiene la redirección al login. verifyToken exige valid:true en el cuerpo de la respuesta; un HTTP 200 con valid:false ya no se considera una sesión válida.
- Se genera un borrador después de 600 ms sin cambios, con todos los campos, fechas, foto y firmas pendientes. Se guarda cifrado con AES-GCM y una clave no exportable en IndexedDB, separado por usuario y paciente y con control de revisión para no sobrescribir otra pestaña. No se guardan datos clínicos ni contraseñas en localStorage. Solo se usa allí una marca de cierre de sesión, sin contenido de ficha.
- El borrador se recupera en ese mismo navegador después de verificar la cuenta y el acceso al paciente. Se ofrece Recuperar/Descartar antes de montar el formulario. No reemplaza silenciosamente la versión del servidor ni se publica como ficha completa: Guardar sigue siendo la acción que escribe en el backend.
- El borrador vence a las 24 horas de su última copia. Los vencidos se descartan al consultarlos. Guardar correctamente limpia el borrador propio; cerrar sesión borra los borradores y las claves de esa cuenta y avisa a otras pestañas para que no los vuelvan a crear sin reingresar.
- Un fallo de lectura del servidor muestra Reintentar carga y no habilita una ficha vacía. Los fallos del almacenamiento local se muestran de forma visible y no bloquean Guardar en el servidor. Antes de recargar/cerrar una ficha con cambios se activa el aviso del navegador.

El borrador depende del almacenamiento de ese navegador; no es una copia en otro dispositivo ni un backup de servidor. Una interrupción antes de terminar la última copia puede conservar solo la anterior. Si el navegador rechaza el almacenamiento, hay que mantener la ficha abierta hasta guardarla. Las firmas se conservan como PNG, incluidas las que aún no se habían confirmado con Guardar firma.

### Despliegue manual

Desplegar primero el backend y después el frontend, que requiere los nuevos endpoints POST /medical-session/{patient_id} y POST /medical-session/{patient_id}/reauthenticate. No se requiere SQL nuevo. Las autorizaciones de edición siguen siendo las existentes (administración y profesionales).

Los tokens emitidos previamente mantienen su vencimiento original. Una ficha abierta con la versión nueva y una sesión todavía válida obtiene seis horas; si ya venció, se debe reingresar. El borrador se crea desde esta versión y no puede recuperar datos perdidos anteriormente.

La suite comprueba seis horas mediante reloj virtual del navegador y la duración real del JWT mediante el backend. Prueba recuperación de texto/foto/firma tras cerrar una pestaña, reingreso en la misma pantalla, aislamiento entre cuentas, cifrado y clave no exportable, vencimiento/limpieza de borradores y fallos de lectura/almacenamiento.
