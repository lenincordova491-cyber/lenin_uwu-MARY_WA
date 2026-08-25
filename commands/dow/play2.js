import { existsSync, mkdirSync, statSync, unlinkSync } from 'fs'
import { execFile } from 'child_process'
import path from 'path'
import { promisify } from 'util'
import ffmpegPath from 'ffmpeg-static'
import ytdlp from 'yt-dlp-exec'
import { resolveVideo } from '../../lib/ytResolve.js'
import { getPngThumbnail } from '../../lib/ytThumbnail.js'
import { formatSize } from '../../lib/mediaSize.js'
import { guardDownload } from '../../lib/downloadGuard.js'
import { withTimeout } from '../../lib/fetchUtils.js'
import { agregarACache, getYouTubeId, obtenerDeCache } from '../../lib/cacheManager.js'

const execFileAsync = promisify(execFile)
const MAX_VIDEO_BYTES = 200 * 1024 * 1024
const TEMP_DIR = path.resolve('./temp')

export default {
  command: ['play2', 'ytmp4'],
  category: 'downloader',
  run: guardDownload('play2', async ({ client, m, text }) => {
    if (!text) {
      return m.reply('✎ Decime qué video buscar.\n\nEjemplo: *.play2* trailer de una película')
    }

    try {
      await client.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      const found = await resolveVideo(text)
      if (!found?.url) return m.reply('✘ No encontré resultados para esa búsqueda.')

      const id = `play2-${getYouTubeId(found.url) || encodeURIComponent(found.url)}`
      const cachedPath = obtenerDeCache(id)
      mkdirSync(TEMP_DIR, { recursive: true })
      const fileBase = path.join(TEMP_DIR, `${id}`)
      const sourcePath = `${fileBase}-source.mp4`
      const outputPath = `${fileBase}.mp4`
      let cacheVideo = false
      try {
        if (!cachedPath) {
          await withTimeout((async () => {
            await ytdlp(found.url, {
              ffmpegLocation: ffmpegPath,
              format: 'bv*[height<=360][ext=mp4]+ba[ext=m4a]/bv*[height<=360]+ba/b[height<=360]',
              mergeOutputFormat: 'mp4',
              extractorArgs: 'youtube:player_client=android',
              maxFilesize: '200M',
              noPlaylist: true,
              noWarnings: true,
              output: sourcePath,
            })

            await execFileAsync(ffmpegPath, [
              '-y',
              '-i',
              sourcePath,
              '-c:v',
              'libx264',
              '-preset',
              'veryfast',
              '-crf',
              '28',
              '-c:a',
              'aac',
              '-b:a',
              '128k',
              '-movflags',
              '+faststart',
              outputPath,
            ])
          })(), 60000)
        }

        const videoPath = cachedPath || outputPath
        const videoSize = statSync(videoPath).size
        const size = formatSize(videoSize)

        if (videoSize > MAX_VIDEO_BYTES) {
          return m.reply(`✘ No se pudo enviar el video porque supera el límite de 200 MB.\n📦 Peso: ${size}`)
        }

        try {
          const thumbnail = await getPngThumbnail(found.thumbnail)
          if (thumbnail) {
            await client.sendMessage(
              m.chat,
              { image: thumbnail, mimetype: 'image/png', caption: `🖼️ Portada en formato PNG\n📦 Peso: ${size}\n⏳ Espere su video papu...` },
              { quoted: m }
            )
          }
        } catch (error) {
          console.error('[play2] No se pudo enviar la portada:', error.message)
        }

        await client.sendMessage(
          m.chat,
          {
            video: { url: videoPath },
            mimetype: 'video/mp4',
            caption: `✰ *YOUTUBE* ✰\n✎ ${found.title || ''}`,
          },
          { quoted: m }
        )
        cacheVideo = !cachedPath
      } finally {
        if (existsSync(sourcePath)) unlinkSync(sourcePath)
        if (cacheVideo && existsSync(outputPath)) {
          agregarACache(id, outputPath, 15)
        } else if (!cachedPath && existsSync(outputPath)) {
          unlinkSync(outputPath)
        }
      }

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (e) {
      console.error('[play2]', e)
      await client.sendMessage(m.chat, { react: { text: 'âŒ', key: m.key } })
      await m.reply('âœ˜ No se pudo descargar el video. IntentÃ¡ con otro enlace o bÃºsqueda.')
    }
  }),
}
