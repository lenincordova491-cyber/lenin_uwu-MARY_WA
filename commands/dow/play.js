import { ytmp3 } from '@vreden/youtube_scraper'
import { createWriteStream, existsSync, mkdirSync, statSync, unlinkSync } from 'fs'
import { Readable } from 'stream'
import { resolveVideo } from '../../lib/ytResolve.js'
import { getPngThumbnail } from '../../lib/ytThumbnail.js'
import { formatSize } from '../../lib/mediaSize.js'
import { guardDownload } from '../../lib/downloadGuard.js'
import { agregarACache, getYouTubeId, obtenerDeCache } from '../../lib/cacheManager.js'
import { withTimeout } from '../../lib/fetchUtils.js'

function extractUrl(download) {
  if (!download) return null
  return typeof download === 'string' ? download : download.url
}

const TEMP_DIR = './temp'
const MAX_AUDIO_BYTES = 200 * 1024 * 1024

async function downloadToFile(url, filePath) {
  const response = await fetch(url)
  if (!response.ok || !response.body) {
    throw new Error(`No se pudo descargar el audio (${response.status})`)
  }

  const contentLength = Number(response.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_AUDIO_BYTES) {
    throw new Error('El audio supera el límite de 200 MB')
  }

  await new Promise((resolve, reject) => {
    const stream = createWriteStream(filePath)
    Readable.fromWeb(response.body).pipe(stream)
    stream.on('finish', resolve)
    stream.on('error', reject)
  })
}

export default {
  command: ['play', 'ytmp3'],
  category: 'downloader',
  run: guardDownload('play', async ({ client, m, text }) => {
    if (!text) {
      return m.reply('✎ Decime qué canción o video buscar.\n\nEjemplo: *.play* bad bunny monaco')
    }

    try {
      await client.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      const found = await resolveVideo(text)
      if (!found?.url) return m.reply('✘ No encontré resultados para esa búsqueda.')

      const id = `play-${getYouTubeId(found.url) || encodeURIComponent(found.url)}`
      const cachedPath = obtenerDeCache(id)
      const audioPath = cachedPath || `${TEMP_DIR}/${id}.mp3`
      let cacheAudio = false

      let result
      let audioUrl
      let lastError
      try {
        if (!cachedPath) {
          mkdirSync(TEMP_DIR, { recursive: true })
          await withTimeout((async () => {
            for (let attempt = 0; attempt < 3 && !audioUrl; attempt++) {
              try {
                result = await ytmp3(found.url, 128)
                audioUrl = extractUrl(result?.download)
              } catch (error) {
                lastError = error
              }
            }

            if (!result?.status || !audioUrl) {
              if (lastError) console.error('[play] Error del descargador:', lastError)
              throw new Error('No se pudo obtener el audio')
            }

            await downloadToFile(audioUrl, audioPath)
          })(), 60000)

          const audioSize = statSync(audioPath).size
          if (audioSize > MAX_AUDIO_BYTES) {
            throw new Error('El audio supera el límite de 200 MB')
          }
          cacheAudio = true
        }

      const title = result?.metadata?.title || found.title || 'audio'
      const size = formatSize(statSync(audioPath).size)

      try {
        const thumbnail = await getPngThumbnail(found.thumbnail)
        if (thumbnail) {
          await client.sendMessage(
            m.chat,
            { image: thumbnail, mimetype: 'image/png', caption: `🖼️ Portada en formato PNG\n📦 Peso: ${size}\n⏳ Espere su audio papu...` },
            { quoted: m }
          )
        }
      } catch (error) {
        console.error('[play] No se pudo enviar la portada:', error.message)
      }

      await client.sendMessage(
        m.chat,
        {
          audio: { url: audioPath },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`,
        },
        { quoted: m }
      )

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      } finally {
        if (cacheAudio && existsSync(audioPath)) {
          agregarACache(id, audioPath, 15)
        } else if (!cachedPath && existsSync(audioPath)) {
          unlinkSync(audioPath)
        }
      }
    } catch (e) {
      console.error('[play]', e)
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      m.reply('✘ El servicio no está disponible en este momento.')
    }
  }),
}
