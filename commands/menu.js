import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import path from 'path'

const configuredLogoPath = process.env.MENU_LOGO_PATH
  ? path.resolve(process.env.MENU_LOGO_PATH)
  : null
const defaultLogoPath = path.resolve('assets/logo.jpg')
const LOGO_PATH = configuredLogoPath && existsSync(configuredLogoPath)
  ? configuredLogoPath
  : defaultLogoPath

const MENU_TEXT = `╭━━━━━━━━━━━━━━━━━━╮
┃   *✦ M A R Y _ W A ✦*   ┃
╰━━━━━━━━━━━━━━━━━━╯

👋 Hola, *MARY_WA*

╭─〔 🤖 INFORMACIÓN 〕
│ ⚡ Bot: *MARY_WA*
│ 👑 Owner: *lenin_uwu*
│ 🔧 Versión: *1.0.0*
╰──────────────

╭─〔 📥 DESCARGAS 〕
│ • *.tiktok* / *.tt*
│ • *.fb* / *.facebook*
│ • *.instagram* / *.ig*
│ • *.play* / *.ytmp3*
│ • *.play2* / *.ytmp4*
│ • *.spotify* / *.sp*
│ • *.tts*
╰──────────────

╭─〔 ⚙️ GENERAL 〕
│ • *.menu*
│ • *.ping* / *.estado*
╰──────────────

╭─〔 🛡️ MODERACIÓN 〕
│ • *.antilink* on/off
╰──────────────

╭─〔 🖼️ CONVERTIDORES 〕
│ • *.s* / *.stiker* / *.sticker*
╰──────────────

╭─〔 💡 USO RÁPIDO 〕
│ • *.tiktok* <enlace>
│ • *.instagram* <enlace>
│ • *.play* <búsqueda>
│ • *.play2* <búsqueda>
╰──────────────

*✦ MARY_WA • lenin_uwu ✦*`

export default {
  command: 'menu',
  category: 'general',
  run: async ({ client, m }) => {
    try {
      const logo = await readFile(LOGO_PATH)
      await client.sendMessage(
        m.chat,
        {
          image: logo,
          mimetype: 'image/jpeg',
          caption: MENU_TEXT,
        },
        { quoted: m }
      )
    } catch (error) {
      console.error('[menu] No se pudo enviar el logo:', error)
      await m.reply(MENU_TEXT)
    }
  },
}