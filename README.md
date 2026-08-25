<p align="center"><img src="./assets/logo.jpg" alt="MARY_WA Logo" width="350"></p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=2800&pause=900&color=A78BFA&center=true&vCenter=true&width=760&lines=El+est%C3%A1ndar+de+eficiencia.;Cero+fugas+de+memoria.;Optimizado+para+Linux.;Desarrollado+por+leninBy." alt="MARY_WA typing animation">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20%2B-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 20+">
  <img src="https://img.shields.io/badge/Zorin_OS-Linux-15A6F0?style=for-the-badge&logo=zorin&logoColor=white" alt="Zorin OS">
  <img src="https://img.shields.io/badge/Baileys-6.7.9-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Baileys">
  <img src="https://img.shields.io/badge/ESM-Native-8B5CF6?style=for-the-badge&logo=javascript&logoColor=white" alt="ECMAScript Modules">
</p>

<p align="center">
  <strong>MARY_WA</strong> es un bot de WhatsApp modular y orientado al rendimiento, construido con <code>@whiskeysockets/baileys</code> en ESM. Su arquitectura esta pensada para operar 24/7 en Linux, incluso en servidores con recursos limitados y alrededor de 3 GB de RAM.
</p>

## ⚡ Filosofía de desarrollo

MARY_WA prioriza un flujo de datos predecible: menos memoria retenida, límites claros y responsabilidades separadas.

| Sistema | Decisión técnica | Resultado |
| --- | --- | --- |
| **Cero Buffers** | El contenido multimedia se escribe directamente a disco mediante `yt-dlp` y FFmpeg. | Menor consumo de RAM durante descargas grandes. |
| **Caché inteligente** | Los archivos procesados se reutilizan durante 15 minutos. | Respuestas más rápidas sin repetir descargas. |
| **Red blindada** | Operaciones externas con timeout de 60 s y límite de 200 MB. | Fallos controlados y protección frente a archivos excesivos. |
| **Moderación** | `.antilink` intercepta y descarta enlaces antes de llegar al despachador. | Menos trabajo innecesario en el flujo principal. |

## 🧰 Capacidades

- Descargas de TikTok, Instagram, Facebook y YouTube.
- Conversión de audio y video con FFmpeg.
- Caché temporal para contenido multimedia solicitado nuevamente.
- Sistema de comandos auto cargable desde `commands/`.
- Moderación configurable por grupo mediante `.antilink on/off`.
- Texto a voz y utilidades para WhatsApp.

<details>
<summary><strong>📂 Ver estructura del proyecto</strong></summary>

```text
MARY_WA/
├── commands/
│   ├── dow/                 # Descargas y conversiones
│   │   ├── facebook.js
│   │   ├── instagram.js
│   │   ├── play.js          # YouTube audio
│   │   ├── play2.js         # YouTube video
│   │   ├── spotify.js
│   │   └── tiktok.js
│   ├── mod/                 # Moderacion
│   │   └── antilink.js
│   └── util/                # Utilidades
│       ├── tts.js
│       └── menu.js
├── lib/                     # Cola, cache, red y serializacion
│   ├── cacheManager.js
│   ├── cooldown.js
│   ├── downloadGuard.js
│   ├── fetchUtils.js
│   ├── groupManager.js
│   ├── mediaSize.js
│   ├── queue.js
│   ├── serialize.js
│   ├── ytResolve.js
│   └── ytThumbnail.js
├── database/                # Datos locales, no publicados
├── temp/                    # Archivos temporales autogenerados
├── handler.js               # Carga y despacha comandos
├── index.js                 # Conexion con WhatsApp
├── settings.js              # Configuracion desde variables de entorno
├── .env.example
└── package.json
```

</details>

<details>
<summary><strong>🚀 Instalacion en Zorin OS / Ubuntu</strong></summary>

### Requisitos

- Linux basado en Ubuntu, como Zorin OS.
- Node.js 20 o superior.
- Una cuenta de WhatsApp para vincular el bot.

### Dependencias del sistema

```bash
sudo apt update && sudo apt install ffmpeg build-essential python3 -y
```

### Instalar MARY_WA

```bash
git clone https://github.com/lenincordova491-cyber/lenin_uwu-MARY_WA.git
cd lenin_uwu-MARY_WA
npm install
cp .env.example .env
nano .env
```

Configura en `.env` el prefijo, el nombre del bot y el número de emparejamiento si vas a utilizar código de vinculación. Las credenciales privadas deben permanecer únicamente en `.env`.

### Primer arranque

```bash
npm start
```

Escanea el código QR desde WhatsApp en **Configuración → Dispositivos vinculados**. La sesión se guarda en `session/`, una carpeta local que no debe subirse al repositorio.

### Despliegue 24/7 con PM2

```bash
sudo npm install -g pm2
pm2 start index.js --name "mary-wa"
pm2 save
pm2 startup
pm2 logs mary-wa
```

</details>

## 🧩 Desarrollo modular

Cada comando exporta un objeto con `command`, `category` y `run`. El archivo `handler.js` recorre automáticamente `commands/`, registra sus alias y lo carga en el siguiente arranque.

```js
export default {
  command: ['saludo', 'hello'],
  category: 'utilidad',
  run: async ({ m, text }) => {
    const nombre = text || 'mundo'
    await m.reply(`Hola, ${nombre}. MARY_WA esta listo.`)
  },
}
```

Guarda el archivo, reinicia el proceso y el comando quedara disponible como `.saludo` y `.hello` sin modificar `handler.js`.

## 🔐 Seguridad

No publiques `session/`, `.env`, `database/*.json`, archivos multimedia ni credenciales de servicios externos. Utiliza `.env.example` como plantilla y genera credenciales nuevas si alguna clave fue expuesta.

## 📄 Licencia

Distribuido bajo la licencia MIT. Consulta [LICENSE](LICENSE) para más información.
