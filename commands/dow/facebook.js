import { fbdl } from 'ruhend-scraper'
import { guardDownload } from '../../lib/downloadGuard.js'

export default {
  command: ['fb', 'facebook'],
  category: 'downloader',
  run: guardDownload('facebook', async ({ client, m, args }) => {
    const url = args[0]
    if (!url || !url.match(/facebook\.com|fb\.watch|video\.fb\.com/)) {
      return m.reply('✎ Ingresá un *URL* válido de Facebook.')
    }

    try {
      await client.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      const data = await fbdl(url)
      const videoUrl = Array.isArray(data)
        ? data.find(item => typeof item === 'string' ? item : item?.url)?.url || data.find(item => typeof item === 'string')
        : data?.video || data?.url

      if (!videoUrl) {
        return m.reply('✘ No se pudo obtener el video. Verificá que sea público.')
      }

      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          caption: `✰ *FACEBOOK* ✰\n✎ Enlace: ${url}`,
          mimetype: 'video/mp4',
        },
        { quoted: m }
      )

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.error('[facebook]', e.message)
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      m.reply('✘ El servicio no está disponible en este momento.')
    }
  }),
}
