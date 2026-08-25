import Spotify from 'spotifydl-x'
import { existsSync, mkdirSync, statSync, unlinkSync } from 'fs'
import path from 'path'
import settings from '../../settings.js'
import { agregarACache, obtenerDeCache } from '../../lib/cacheManager.js'
import { withTimeout } from '../../lib/fetchUtils.js'
import { guardDownload } from '../../lib/downloadGuard.js'

const TEMP_DIR = './temp'
const MAX_AUDIO_BYTES = 200 * 1024 * 1024

function getTrackId(url) {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname !== 'open.spotify.com') return null
    if (!parsedUrl.pathname.startsWith('/track/')) return null
    return parsedUrl.pathname.split('/')[2] || null
  } catch {
    return null
  }
}

export default {
  command: ['spotify', 'sp'],
  category: 'downloader',
  run: guardDownload('spotify', async ({ client, m, args }) => {
    const url = args[0]
    const id = url && getTrackId(url)

    if (!id) {
      return m.reply('✎ Ingresá un URL válido de una canción de Spotify.')
    }

    const cacheId = `spotify-${id}`
    const cachedPath = obtenerDeCache(cacheId)
    if (cachedPath) {
      return client.sendMessage(
        m.chat,
        { audio: { url: cachedPath }, mimetype: 'audio/mpeg' },
        { quoted: m }
      )
    }

    if (!settings.spotifyClientId || !settings.spotifyClientSecret) {
      return m.reply('✘ Configurá SPOTIFY_CLIENT_ID y SPOTIFY_CLIENT_SECRET en .env.')
    }

    const tempPath = path.join(TEMP_DIR, `${cacheId}.mp3`)
    let cacheAudio = false

    try {
      await client.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
      mkdirSync(TEMP_DIR, { recursive: true })

      const spotify = new Spotify({
        clientId: settings.spotifyClientId,
        clientSecret: settings.spotifyClientSecret,
      })

      const track = await withTimeout(spotify.getTrack(url), 60000)
      await withTimeout(spotify.downloadTrack(url, tempPath), 60000)

      if (!existsSync(tempPath)) throw new Error('Spotify no creó el archivo de audio')
      const audioSize = statSync(tempPath).size
      if (audioSize <= 0) throw new Error('El archivo de audio está vacío')
      if (audioSize > MAX_AUDIO_BYTES) {
        throw new Error('El audio supera el límite de 200 MB')
      }

      const title = track?.name || 'audio'
      const artist = Array.isArray(track?.artists) ? track.artists.join(', ') : 'Spotify'
      await client.sendMessage(
        m.chat,
        {
          audio: { url: tempPath },
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`,
          caption: `✰ *SPOTIFY* ✰\n✎ *Título:* ${title}\n✎ *Artista:* ${artist}`,
        },
        { quoted: m }
      )

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
      cacheAudio = true
    } catch (error) {
      console.error('[spotify]', error)
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      await m.reply(error.message.includes('200 MB')
        ? '✘ No se pudo enviar el audio porque supera el límite de 200 MB.'
        : '✘ No se pudo descargar la canción de Spotify.')
    } finally {
      if (cacheAudio && existsSync(tempPath)) {
        agregarACache(cacheId, tempPath, 15)
      } else if (existsSync(tempPath)) {
        unlinkSync(tempPath)
      }
    }
  }),
}
