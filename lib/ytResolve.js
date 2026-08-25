import { search } from '@vreden/youtube_scraper'

const YT_URL_RE = /(?:youtube\.com|youtu\.be)\//

/**
 * Recibe una URL de YouTube o un término de búsqueda.
 * Devuelve { url, title } del primer resultado, o null si no hay nada.
 */
export async function resolveVideo(query) {
  if (YT_URL_RE.test(query)) {
    const videoId = query.includes('youtu.be/')
      ? query.split('youtu.be/')[1]?.split(/[?&#]/)[0]
      : new URL(query).searchParams.get('v')
    return {
      url: query,
      title: null,
      thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : null,
    }
  }

  const res = await search(query)
  if (!res?.status || !res.results?.length) return null

  const first = res.results[0]
  return {
    url: first.url,
    title: first.title,
    thumbnail: first.thumbnail || first.image || null,
  }
}

export default resolveVideo
