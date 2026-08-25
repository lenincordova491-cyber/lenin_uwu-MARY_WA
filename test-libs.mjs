// Script de diagnóstico. Corré esto directo con:
//   node test-libs.mjs
// y pegame TODO lo que imprima (no solo la última línea).

import { ttdl, fbdl, igdl } from 'ruhend-scraper'
import { search, ytmp3 } from '@vreden/youtube_scraper'

// Reemplazá estas URLs por unas reales y públicas antes de correr el script.
const TIKTOK_URL = 'https://www.tiktok.com/@scout2015/video/6718335390845095173'
const FACEBOOK_URL = 'https://www.facebook.com/facebook/videos/10153231379946729/'
const INSTAGRAM_URL = 'https://www.instagram.com/instagram/reel/DcOkE0Myfhh/'
const YT_QUERY = 'bad bunny monaco'

async function test(name, fn) {
  console.log(`\n=== ${name} ===`)
  try {
    const result = await fn()
    console.log('OK →', JSON.stringify(result, null, 2))
  } catch (e) {
    console.log('ERROR →', e)
    console.log('STACK →', e?.stack)
  }
}

await test('ttdl (TikTok)', () => ttdl(TIKTOK_URL))
await test('fbdl (Facebook)', () => fbdl(FACEBOOK_URL))
await test('igdl (Instagram)', () => igdl(INSTAGRAM_URL))
await test('ytsearch (@vreden)', () => search(YT_QUERY))
await test('ytmp3 (@vreden)', async () => {
  const s = await search(YT_QUERY)
  const url = s?.results?.[0]?.url
  console.log('URL encontrada:', url)
  return ytmp3(url, 128)
})
