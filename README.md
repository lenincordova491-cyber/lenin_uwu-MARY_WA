<p align="center">
  <img src="./image_b0552b.png" alt="MARY_WA Logo" width="350">
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=9C88FF&center=true&vCenter=true&width=600&lines=El+est%C3%A1ndar+de+eficiencia.;Cero+fugas+de+memoria.;Optimizado+para+Linux.;Desarrollado+por+leninBy." alt="Typing SVG" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-26.4.0-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 26.4.0" />
  <img src="https://img.shields.io/badge/Zorin_OS-Linux-00ADD8?style=for-the-badge&logo=linux&logoColor=white" alt="Zorin OS" />
  <img src="https://img.shields.io/badge/Baileys-6.7.9-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Baileys 6.7.9" />
  <img src="https://img.shields.io/badge/ESM-Native-9C88FF?style=for-the-badge&logo=javascript&logoColor=white" alt="ESM" />
</p>

---

## 🧠 Filosofía de Desarrollo

La mayoría de los bots colapsan por fugas de memoria (OOM) al manejar múltiples descargas multimedia. **MARY_WA** resuelve este problema de raíz mediante una arquitectura estricta:

*   **Cero Buffers:** El procesamiento multimedia ocurre directamente en el disco duro. El bot jamás satura la RAM cargando videos o audios completos en memoria.
*   **Caché Inteligente:** Reutilización de archivos temporales. Si un contenido se solicita varias veces en un lapso de 15 minutos, se envía instantáneamente desde el almacenamiento local.
*   **Red Blindada:** Timeouts estrictos de 60s y bloqueos preventivos por peso (máximo 200MB) evitan procesos colgados o consumo excesivo de ancho de banda.
*   **Moderación Proactiva:** El sistema `.antilink` intercepta y descarta infracciones antes de que el mensaje llegue al motor de comandos, ahorrando valiosos ciclos de CPU.

---

<details>
  <summary><b>📂 Estructura de Carpetas</b></summary>

```text
mary-wa/
├── commands/         # Módulos de ejecución dinámica
│   ├── dow/          # Gestores de descarga (Spotify, YouTube, Redes)
│   ├── mod/          # Lógica de moderación comunitaria
│   └── util/         # Herramientas sin consumo local (TTS, Ping)
├── lib/              # Núcleo de la arquitectura
│   ├── cacheManager.js
│   ├── fetchUtils.js
│   ├── groupManager.js
│   └── serialize.js
├── database/         # Persistencia de estados (JSON)
├── temp/             # Tránsito multimedia (Auto-limpieza)
├── handler.js        # Middleware e interceptor de eventos
└── index.js          # Entrypoint de red
```
</details>

<details>
  <summary><b>🐧 Instalación y Despliegue (Linux)</b></summary>

MARY_WA está optimizado para distribuciones Linux (Ubuntu, Zorin OS, Debian).

**1. Preparación del Sistema**
Asegúrate de contar con los compiladores y herramientas multimedia:

```bash
sudo apt update && sudo apt install ffmpeg build-essential python3 -y
```

**2. Instalación de Dependencias**

```bash
npm install
cp .env.example .env
```

**3. Ejecución 24/7 (PM2)**
Para mantener el bot activo tras cerrar la sesión:

```bash
sudo npm install -g pm2
pm2 start index.js --name "mary-wa"
pm2 save
pm2 logs mary-wa
```
</details>

<details>
  <summary><b>🧩 Desarrollo Modular</b></summary>

Agregar nuevas funciones es un proceso automatizado. Crea un archivo en cualquier directorio dentro de `commands/` exportando la siguiente estructura. El `handler.js` lo registrará de forma dinámica.

```javascript
export default {
  command: ['comando', 'alias'],
  category: 'utilidad',
  run: async ({ client, m, args, text }) => {
    await m.reply('Estructura modular activa y funcionando.')
  },
}
```
</details>
