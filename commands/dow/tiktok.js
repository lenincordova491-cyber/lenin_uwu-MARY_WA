import Tiktok from '@tobyg74/tiktok-api-dl'
import { guardDownload } from '../../lib/downloadGuard.js'

function normalizeVideoUrl(response, version) {
  if (response?.status !== 'success') return null

  const videoUrl =
    version === 'v1'
      ? response.result?.video?.playAddr?.[0]
      : version === 'v2'
        ? response.result?.video?.playAddr || response.result?.direct
        : response.result?.videoHD || response.result?.videoWatermark

  return typeof videoUrl === 'string' && /^https?:\/\//.test(videoUrl) ? videoUrl : null
}

export default {
  command: ['tiktok', 'tt'],
  category: 'downloader',
  run: guardDownload('tiktok', async ({ client, m, args }) => {
    const url = args[0]
    if (!url || !url.includes('tiktok.com')) {
      return m.reply(`✎ Ingresá un *URL* válido de TikTok.\n\nEjemplo: *.tiktok* https://vt.tiktok.com/...`)
    }

    try {
      await client.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      let data
      let videoUrl
      for (const version of ['v1', 'v2', 'v3']) {
        try {
          const result = await Tiktok.Downloader(url, { version })
          const normalizedUrl = normalizeVideoUrl(result, version)
          if (normalizedUrl) {
            data = result
            videoUrl = normalizedUrl
            break
          }
        } catch (error) {
          console.error(`[tiktok] ${version}:`, error.message)
        }
      }

      if (!data || !videoUrl) {
        return m.reply('✘ No se pudo obtener el video. Verificá que el enlace sea público.')
      }

      const result = data.result || {}
      const caption = `✰ *TIKTOK* ✰
✎ *Título:* ${result.desc || 'Sin título'}
✎ *Autor:* ${result.author?.nickname || result.author?.username || 'Desconocido'}
✎ *Likes:* ${result.statistics?.likeCount ?? 'N/A'}
✎ *Vistas:* ${result.statistics?.playCount ?? 'N/A'}`

      await client.sendMessage(
        m.chat,
        { video: { url: videoUrl }, caption },
        { quoted: m }
      )

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.error('[tiktok]', e.message)
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      m.reply('✘ El servicio no está disponible en este momento. Probá de nuevo en un rato.')
    }
  }),
}
