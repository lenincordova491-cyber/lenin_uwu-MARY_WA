import { getAudioUrl } from 'google-tts-api'

export default {
  command: 'tts',
  category: 'utilidad',
  run: async ({ client, m, text }) => {
    if (!text?.trim()) {
      return m.reply('✎ Escribí el texto para convertirlo en voz.\n\nEjemplo: *.tts* Hola mundo')
    }

    try {
      const texto = text.trim().substring(0, 200)
      const urlObtenida = getAudioUrl(texto, {
        lang: 'es',
        slow: false,
        host: 'https://translate.google.com',
      })

      await client.sendMessage(
        m.chat,
        { audio: { url: urlObtenida }, mimetype: 'audio/mpeg', ptt: false },
        { quoted: m }
      )
    } catch (error) {
      console.error('[tts]', error)
      await m.reply('❌ Error al generar el audio. Intenta con un texto más corto.')
    }
  },
}
