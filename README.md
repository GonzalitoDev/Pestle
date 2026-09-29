# Pestle — Compartir código y texto

Un **Pastebin rápido para compartir fragmentos de código**, con resaltado de sintaxis y preparado para desplegarse en **Vercel**.

* **Frontend:** React 19 + Vite + Tailwind CSS (SPA estática)
* **Backend:** Vercel Functions en [`api/`](api), respaldadas por **Upstash Redis**
* **Tema claro / oscuro / sistema**, con un interruptor en el encabezado que recuerda la configuración por navegador
* **Biblioteca de código** (`/codes`): 29 fragmentos probados y funcionales (JavaScript, TypeScript, Python, HTML, CSS, JSON y Markdown), con búsqueda, filtros por lenguaje, copiar, descargar y *Editar y compartir*
* **Ejecutor en el navegador:** JavaScript, **Python** (mediante Pyodide/WebAssembly), HTML y CSS se ejecutan en un iframe aislado, con una consola en tiempo real. Está disponible en la biblioteca, en el editor antes de publicar y en cualquier código compartido
* **Detección automática del lenguaje:** al pegar código, Pestle selecciona automáticamente el lenguaje. Un aviso informa si detecta una posible incompatibilidad. Incluso si un código se guarda con el lenguaje incorrecto, por ejemplo Python como JavaScript, puede ejecutarse utilizando el intérprete correspondiente
* **Feed público** (`/explore`) de códigos compartidos públicamente. Los códigos no listados permanecen accesibles únicamente mediante su enlace
* Podés **crear un fork de cualquier código** para abrirlo en el editor, copiar su enlace o descargarlo utilizando la extensión de archivo correspondiente
* **Identidad anónima por navegador:** permite consultar tus códigos desde *Mi Vault* y eliminarlos
* **Expiración opcional:** 1 hora, 1 día o 1 semana, aplicada mediante TTL de Redis
* **Endpoint sin formato:** `GET /api/pastes/:id?raw=1`
* **Documentación completa de la API:** disponible en `/api-docs`

## Aplicación Android (APK)

La carpeta `android/` contiene una aplicación desarrollada con **Capacitor** que incluye toda la interfaz de Pestle, incluyendo el editor, la biblioteca y el ejecutor de código.

La aplicación se comunica con la API del sitio desplegado mediante `VITE_API_BASE`, cuyo valor predeterminado es:

`https://pestesting.vercel.app`

Si no existe conexión a Internet o el sitio no está disponible, la aplicación puede funcionar **sin conexión** y conservar los códigos compartidos en el teléfono.

### Descarga

Cada actualización enviada a `main` genera automáticamente el APK mediante **GitHub Actions** y lo publica en **Releases** como `Pestle.apk`.

En el teléfono, simplemente se abre el APK y se permite la instalación desde esa fuente cuando Android lo solicite.

El flujo de trabajo utiliza únicamente las acciones oficiales de GitHub fijadas a identificadores de commit. Por lo tanto, en **Settings → Actions → General** se puede seleccionar:

**Allow GitHub-created actions only**

El trabajo de compilación utiliza un token de solo lectura y únicamente el trabajo de publicación puede escribir versiones (*releases*).

Los permisos generales del repositorio pueden mantenerse en:

**Read repository contents**

### Firma de la aplicación

Las actualizaciones se pueden instalar sobre la versión anterior únicamente si todas las compilaciones están firmadas con la misma clave.

La clave se puede crear una sola vez mediante:

```bash
keytool -genkeypair -v -keystore pestle.jks -alias pestle -keyalg RSA -keysize 4096 -validity 10000
base64 -w0 pestle.jks
```

Después, hay que agregar estos secretos al repositorio desde:

**Settings → Secrets and variables → Actions**

* `ANDROID_KEYSTORE_BASE64`
* `ANDROID_KEYSTORE_PASSWORD`
* `ANDROID_KEY_ALIAS` (`pestle`)
* `ANDROID_KEY_PASSWORD`

El archivo `pestle.jks` debe mantenerse privado y contar con una copia de seguridad.

Sin estos secretos, el flujo de trabajo todavía puede generar un APK firmado para depuración, pero será necesario desinstalar la versión anterior antes de instalar una nueva.

Para utilizar otro backend, se puede configurar la variable de repositorio:

`PESTLE_API_URL`

### Compilación local

Se necesita Android Studio o el SDK de Android, además de JDK 21.

```bash
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug
```

El APK generado estará en:

`app/build/outputs/apk/debug/app-debug.apk`

## Seguridad

Pestle incorpora diferentes medidas de seguridad para proteger tanto la aplicación como los códigos ejecutados.

* **Content Security Policy (CSP) estricta** en la aplicación (`script-src 'self'` y sin scripts inline), además de HSTS, `nosniff`, `X-Frame-Options: DENY`, COOP, `Referrer-Policy` y una `Permissions-Policy` restringida. Estas configuraciones se encuentran en `vercel.json`.
* **Ejecutor de código aislado:** el código del usuario se ejecuta en `/runner.html`, dentro de un iframe con sandbox y sin `allow-same-origin`. Cuenta además con su propia CSP (`sandbox`, `form-action 'none'`).
* El código ejecutado no puede acceder al DOM de la aplicación, cookies o almacenamiento, abrir ventanas emergentes, mostrar diálogos, redirigir la página ni enviar formularios a otros sitios.
* **Protección de la API:** validación estricta de entradas, solicitudes `POST` únicamente en formato JSON, bloqueo de envíos mediante formularios entre sitios, límites de tamaño, errores `500` genéricos y protección `nosniff` junto con CSP sandbox en las respuestas.
* Los códigos sin formato (*raw pastes*) siempre se entregan como `text/plain` inerte.
* **Limitación de solicitudes (*rate limiting*) por IP:** 20 creaciones cada 10 minutos, 300 lecturas por minuto y 60 eliminaciones cada 10 minutos.
* Las direcciones IP no se almacenan directamente. Se utiliza un hash con clave que expira junto con la ventana de limitación.
* **Propiedad:** el identificador del propietario del navegador funciona como un secreto. El servidor almacena únicamente un HMAC de dicho identificador y solamente el creador puede eliminar un código.
* Los identificadores de los códigos tienen 12 caracteres base62 sin sesgo, aproximadamente 71 bits, lo que dificulta adivinar enlaces no listados.
* **Aplicación Android:** no utiliza copias de seguridad en la nube para los datos de la aplicación, el tráfico sin cifrado está deshabilitado, la depuración de WebView está desactivada y la API solamente acepta solicitudes de origen cruzado desde el origen propio de la aplicación (`https://localhost`, configurable mediante `CORS_ORIGINS`).
* **Dependencias auditadas:** se utiliza `npm audit`. Actualmente solamente permanece un problema de baja severidad relacionado con el servidor de desarrollo en Windows.

## Ejecutar localmente

Instalar las dependencias:

```bash
npm install
```

Iniciar el proyecto:

```bash
npm run dev
```

Esto ejecuta principalmente el frontend en modo de prueba, utilizando `localStorage`.

### Utilizar la API y la base de datos reales

```bash
npm i -g vercel
vercel link
vercel env pull .env.local
vercel dev
```

## API

| Método   | Ruta                       | Descripción                                                                            |
| -------- | -------------------------- | -------------------------------------------------------------------------------------- |
| `GET`    | `/api/health`              | Devuelve `{ ok, storage }` e indica si Redis está conectado                            |
| `POST`   | `/api/pastes`              | Crea un código: `{ content, language, title?, isPublic?, expiresIn? }`                 |
| `GET`    | `/api/pastes`              | Lista tus códigos. Requiere el encabezado `x-owner-id`                                 |
| `GET`    | `/api/pastes?scope=public` | Obtiene los últimos códigos públicos. El contenido aparece recortado como vista previa |
| `GET`    | `/api/pastes/:id`          | Obtiene un código. `?raw=1` permite obtenerlo como texto plano                         |
| `DELETE` | `/api/pastes/:id`          | Elimina un código. Solamente su creador puede hacerlo utilizando `x-owner-id`          |

### En resumen

**Pestle combina un Pastebin moderno, un editor de código, un ejecutor de diferentes lenguajes, una biblioteca de ejemplos, una API y una aplicación Android**, todo dentro de un mismo proyecto y preparado para desplegarse en Vercel.
