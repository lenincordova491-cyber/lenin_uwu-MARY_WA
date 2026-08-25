# MARY_WA

Bot de WhatsApp hecho con `@whiskeysockets/baileys`, en ESM, con comandos de
descarga para TikTok, Instagram, Facebook y YouTube. Ninguna de las 4
plataformas necesita apikey:

- TikTok / Instagram / Facebook → `ruhend-scraper`
- YouTube (audio y video) → `@vreden/youtube_scraper`

> **Nota:** `ruhend-scraper` también trae una función `ytsearch`, pero en la
> versión publicada (10.0.3) devuelve error interno y no trae `ytmp3`/`ytmp4`
> pese a lo que dice su documentación — por eso YouTube usa una librería
> aparte. Esto se verificó instalando el paquete real, no asumido de memoria.

## Estructura

```
lenin-bot/
├── commands/
│   └── dow/              # comandos de descarga
│       ├── tiktok.js      → .tiktok / .tt
│       ├── instagram.js   → .instagram / .ig
│       ├── facebook.js    → .fb / .facebook
│       ├── play.js        → .play / .ytmp3 (audio)
│       └── play2.js       → .play2 / .ytmp4 (video)
├── lib/
│   ├── serialize.js       # envuelve el mensaje crudo de Baileys
│   └── ytResolve.js       # helper compartido de búsqueda YouTube
├── handler.js             # carga comandos y despacha mensajes
├── index.js               # conexión a WhatsApp (entrypoint)
├── settings.js            # configuración (prefijo, nombre del bot)
└── .env.example
```

## Instalación

```bash
npm install
copy .env.example .env      # en PowerShell / Windows
# cp .env.example .env      # en Linux / Termux / Mac

npm start
```

Al iniciar, va a aparecer un **código QR en la terminal**. Escaneálo desde
WhatsApp → Configuración → Dispositivos vinculados → Vincular dispositivo.

La sesión se guarda en `./session/` — no la borres ni la subas a git
(ya está en `.gitignore`).

## Agregar un comando nuevo

1. Creá un archivo en `commands/dow/` (o una categoría nueva, ej. `commands/juegos/`).
2. Exportá un objeto por defecto con esta forma:

```js
export default {
  command: ['nombre', 'alias'],
  category: 'downloader',
  run: async ({ client, m, args, text }) => {
    // args: array de palabras después del comando
    // text: todo el texto después del comando, como string
    // m.reply('...') responde citando el mensaje original
  },
}
```

El `handler.js` lo detecta solo la próxima vez que arranques el bot — no
hace falta registrarlo en ningún lado más.

## Extender a otras plataformas (Spotify, Twitter, etc.)

`ruhend-scraper` no cubre todo. Si en el futuro querés sumar Spotify,
Twitter/X, MediaFire o Google Drive, vas a necesitar una API externa con
apikey (por ejemplo NyxDLaPI, gratuita). El `.env.example` ya deja los
campos `NYX_BASE` y `NYX_API_KEY` listos para ese caso — solo hay que
crear el archivo del comando siguiendo el mismo patrón que
`commands/dow/tiktok.js`, pero pegándole a la API en vez de a `ruhend-scraper`.
