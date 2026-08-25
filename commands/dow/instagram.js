import { igdl } from 'ruhend-scraper'
import { guardDownload } from '../../lib/downloadGuard.js'

export default {
  command: ['instagram', 'ig'],
  category: 'downloader',
  run: guardDownload('instagram', async ({ client, m, args }) => {
    const url = args[0]
    if (!url || !url.match(/instagram\.com\/(p|reel|share|tv)\//)) {
      return m.reply('✎ Ingresá un *URL* válido de Instagram (post, reel o tv).')
    }

    try {
      await client.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      const res = await igdl(url)
      const mediaList = res?.data
      if (!Array.isArray(mediaList) || mediaList.length === 0) {
        return m.reply('✘ No se encontró contenido en ese enlace. ¿Es público?')
      }

      let enviados = 0
      for (let i = 0; i < mediaList.length; i++) {
        const item = mediaList[i]
        if (!item?.url) continue

        const type = item.url.match(/\.mp4($|\?)/) ? 'video' : 'image'
        try {
          await client.sendMessage(
            m.chat,
            {
              [type]: { url: item.url },
              caption: i === 0 ? `✰ *INSTAGRAM* ✰\n✎ Enlace: ${url}` : undefined,
            },
            { quoted: m }
          )
          enviados++
        } catch (sendErr) {
          console.error('[instagram] fallo al enviar un item:', sendErr.message)
        }
      }

      if (enviados === 0) {
        return m.reply('✘ No se pudo enviar ningún archivo.')
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.error('[instagram]', e.message)
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      m.reply('✘ No se pudo obtener el contenido de Instagram.')
    }
  }),
}
