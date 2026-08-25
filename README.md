# MARY_WA

Bot de WhatsApp de alto rendimiento hecho con `@whiskeysockets/baileys` en ESM. Diseñado con una arquitectura de **Protección de Memoria** para funcionar 24/7 en servidores o equipos con recursos limitados (ej. 3 GB de RAM).

## 🚀 Características Principales

- **Descargas Optimizadas (Cero Buffers):** Audio y video de YouTube y Spotify se descargan a disco (`/temp`) evitando fugas de memoria (OOM).
- **Gestor de Caché:** Los archivos multimedia se almacenan temporalmente por 15 minutos para envíos instantáneos si se solicitan repetidamente.
- **Moderación Proactiva:** Sistema `.antilink` configurable por grupo con base de datos JSON local.
- **Sin APIs de Paga:** Descargas de redes sociales utilizando scrapers ligeros y librerías públicas.

## 📂 Estructura del Proyecto

\`\`\`text
lenin-bot/
├── commands/
│   ├── dow/              # Descargas
│   │   ├── tiktok.js     → .tiktok / .tt
│   │   ├── instagram.js  → .instagram / .ig
│   │   ├── facebook.js   → .fb / .facebook
│   │   ├── play.js       → .play (YouTube Audio)
│   │   ├── play2.js      → .play2 (YouTube Video)
│   │   └── spotify.js    → .spotify / .sp
│   ├── mod/              # Moderación
│   │   └── antilink.js   → .antilink on/off (Solo Admins)
│   └── util/             # Utilidades
│       ├── tts.js        → .tts (Texto a voz sin consumo local)
│       └── menu.js       → .menu / .help
├── lib/
│   ├── cacheManager.js   # Gestión de archivos temporales
│   ├── fetchUtils.js     # Timeouts para protección de red
│   ├── groupManager.js   # Lógica de base de datos JSON
│   └── serialize.js      # Envuelve el mensaje crudo de Baileys
├── database/
│   └── grupos.json       # Persistencia de configuración de grupos
├── temp/                 # (Autogenerada) Archivos en tránsito
├── handler.js            # Interceptor de reglas y despachador
├── index.js              # Entrypoint y conexión
└── settings.js           # Variables globales
\`\`\`

## 🛠️ Instalación (Windows y Linux)

### 1. Preparar el entorno
Necesitas Node.js y **FFmpeg** instalado en tu sistema.
* **Linux (Ubuntu/Zorin):** `sudo apt update && sudo apt install ffmpeg -y`
* **Windows:** Instalar FFmpeg y agregarlo al PATH.

### 2. Instalar y Configurar
\`\`\`bash
npm install
# Copiar configuración
cp .env.example .env
\`\`\`

*Nota: Para que `.spotify` funcione, agrega tus credenciales gratuitas de Spotify Developer en el archivo `.env`.*

### 3. Iniciar el bot (Modo Desarrollo)
\`\`\`bash
npm start
\`\`\`
Escanea el código QR que aparecerá en la terminal desde WhatsApp. La sesión se guarda en `./session/`.

## 🔋 Despliegue 24/7 en Linux (PM2)

Para que el bot siga funcionando aunque cierres la terminal o se suspenda la ventana:

\`\`\`bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar MARY_WA en segundo plano
pm2 start index.js --name "mary-wa"

# Ver la consola en tiempo real
pm2 logs mary-wa
\`\`\`

## 🧩 Cómo agregar comandos
Crea un archivo en cualquier carpeta dentro de `commands/` y exporta el módulo. El `handler.js` lo cargará dinámicamente en el próximo arranque:

\`\`\`js
export default {
  command: ['nombre', 'alias'],
  category: 'utilidad',
  run: async ({ client, m, args, text }) => {
    await m.reply('¡Comando ejecutado exitosamente!');
  },
}
\`\`\`
