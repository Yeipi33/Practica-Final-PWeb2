# EXAMEN.md

## Qué detecté
En `src/controllers/deliverynote.controller.js`, líneas 20 y 191, se devolvía un código HTTP 400 cuando se intentaba firmar o eliminar un albarán ya firmado. Además, los middlewares `express-rate-limit` y `express-mongo-sanitize` estaban instalados en `package.json` pero no registrados en `src/app.js`.

## Cómo lo arreglé
Cambié los dos `AppError(..., 400)` a `AppError(..., 409)` en el controlador de albaranes. En `src/app.js`, añadí los imports de `rateLimit` y `mongoSanitize` y los registré como middlewares globales justo después de `helmet()` y `cors()`, antes de cualquier ruta.

## Por qué mi solución es correcta
HTTP 409 es el código semánticamente correcto cuando la petición es válida en formato pero choca con el estado actual del recurso. Registrar `rateLimit` y `mongoSanitize` en el pipeline de Express es imprescindible para que tengan efecto, ya que tenerlos en `package.json` sin registrarlos no aplica ninguna protección.

## Diferencia semántica entre 400 y 409 según RFC 9110

El RFC 9110 define **400 Bad Request** como la respuesta adecuada cuando el servidor no puede procesar la petición debido a un error de sintaxis, formato o construcción por parte del cliente. En cambio, **409 Conflict** se usa cuando la petición está bien formada y es sintácticamente correcta, pero no puede completarse porque entra en conflicto con el estado actual del recurso en el servidor. En el caso de intentar firmar un albarán ya firmado, el cliente no ha cometido ningún error de formato: su petición es válida, pero choca con el estado `signed: true` del recurso. Devolver 400 en este contexto es engañoso, porque lleva al cliente a pensar que su petición está mal construida cuando en realidad el problema es de estado. Por tanto, 409 es la respuesta correcta y semánticamente honesta según el estándar.

## Preguntas Socraticas
## Pregunta 1 — Semántica HTTP 400 vs 409

¿El cliente cometió un error de formato o la petición choca con el estado del recurso? ¿Qué dice RFC 9110 sobre 409 Conflict?

## Respuesta:
La petición del cliente es perfectamente válida en formato y sintaxis: llega bien construida, con el token correcto y el ID del albarán existente. El problema no está en cómo pidió el cliente, sino en el estado actual del recurso — el albarán ya estaba firmado. El RFC 9110 define 409 Conflict exactamente para este caso: la petición es válida pero no puede completarse porque entra en conflicto con el estado actual del recurso en el servidor. Devolver 400 es engañoso porque lleva al cliente a pensar que su código tiene un bug de formato, cuando en realidad debe cambiar su lógica de negocio (comprobar si el albarán ya está firmado antes de intentarlo).

## Pregunta 2 — mongoSanitize vs helmet, inyección NoSQL

Si un bot envía 5000 peticiones en un segundo a POST /api/user/register, ¿qué ocurre sin mongoSanitize? ¿Qué ataque concreto previene mongoSanitize que helmet no puede prevenir?

## Respuesta:
Sin mongoSanitize, un atacante puede enviar en el body campos como { "email": { "$gt": "" }, "password": { "$gt": "" } } — operadores MongoDB embebidos en el JSON — que Mongoose interpreta como queries reales, pudiendo saltarse la autenticación o extraer datos sin conocer credenciales válidas. Esto se llama inyección NoSQL. helmet opera exclusivamente a nivel de cabeceras HTTP (X-Content-Type-Options, Content-Security-Policy, etc.) y no inspecciona ni sanitiza el body en ningún momento, por lo que no puede prevenir este tipo de ataque. mongoSanitize elimina cualquier clave que empiece por $ o contenga . del body, los params y la query antes de que lleguen a Mongoose, cortando el vector de inyección. Sin rateLimit, las 5000 peticiones llegan todas a MongoDB, pudiendo provocar además una denegación de servicio.

## Pregunta 3 — Bug de aislamiento multi-tenant en Socket.IO

Si el usuario no tiene compañía, companyId es undefined y entra al room company:undefined. ¿Qué pasa cuando otro usuario sin compañía se conecta? ¿Es un bug de aislamiento multi-tenant?

## Respuesta:
Sí, es un bug de aislamiento multi-tenant. Todos los usuarios sin compañía entran al mismo room company:undefined, de modo que cualquier evento emitido a ese room (como deliverynote:new o deliverynote:signed) llega a todos ellos indiscriminadamente, aunque pertenezcan a contextos completamente distintos. Esto rompe el principio de aislamiento entre tenants: un usuario podría recibir en tiempo real datos de albaranes que no le corresponden. La corrección ya está parcialmente en el código — el if (companyId) evita que entren al room — pero el problema de fondo es que un usuario sin compañía no debería poder realizar operaciones sobre recursos que requieren compañía, y eso debería bloquearse antes en un middleware de autorización.

## Pregunta 4 — Patrón para centralizar la comprobación de estado firmado

Si añades PATCH /api/deliverynote/:id para editar un albarán, ¿en cuántos sitios repetirías la comprobación? ¿Qué patrón usarías para centralizarla?

## Respuesta:
Con la estructura actual tendría que repetir if (deliveryNote.signed) en cada controlador que lo necesite: firma, borrado, edición, y cualquier operación futura — lo que viola el principio DRY y facilita que alguien se olvide de añadirla. El patrón más limpio es un middleware de Express reutilizable, por ejemplo checkNotSigned, que cargue el albarán, verifique signed y llame a next(new AppError(..., 409)) si está firmado, dejando el albarán en req.deliveryNote para el controlador. Otra opción es añadir un método de instancia en el modelo Mongoose (deliveryNote.assertNotSigned()) que lance el error, centralizando la lógica en la capa de dominio. El middleware es preferible para endpoints REST porque encaja naturalmente en el pipeline de Express y se puede encadenar en la definición de rutas sin tocar los controladores.

## Pregunta 5 — Cobertura de tests y detección de regresiones

Si alguien cambiara if (deliveryNote.signed) por if (!deliveryNote.signed), ¿tus tests anteriores lo detectarían? ¿Diferencia entre test de contrato de API y test unitario del modelo?

## Respuesta:
Los tests anteriores no lo detectarían, porque solo cubrían creación, listado y borrado de albaranes no firmados — nunca ejercían el caso de rechazar una operación sobre un albarán firmado. Con los dos tests nuevos (409 al re-firmar y 409 al borrar firmado), esa regresión sí se detecta inmediatamente: el test esperaría 409 y recibiría 200, fallando en rojo. Un test de contrato de API (como los de supertest) verifica el comportamiento completo del sistema desde fuera — ruta, middleware, controlador, modelo — y detecta regresiones end-to-end pero sin señalar exactamente dónde está el fallo. Un test unitario del modelo aísla solo la lógica del modelo Mongoose y detecta el fallo en la capa de dominio con precisión quirúrgica, pero no garantiza que el controlador llame correctamente a esa lógica. Lo ideal es tener ambos: los unitarios localizan el bug, los de contrato garantizan que el sistema completo cumple el contrato con el cliente.

## Proceso
Tiempo total invertido: 45 minutos
Herramientas usadas: VS Code, Claude
Prompts a IA:
- "esta es la corrección, ahí se encuentran las preguntas"
- "devuélveme este código con la tarea 1 hecha"
- "cambia este código para la tarea 2"
- "haz la tarea 4 en este código"
- "Documenta en EXAMEN.md la diferencia semántica entre 400 y 409 según RFC 9110"
- "al hacer el test me dan error"