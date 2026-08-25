import sharp from 'sharp'

export async function getPngThumbnail(url) {
  if (!url) return null

  const response = await fetch(url)
  if (!response.ok) throw new Error(`No se pudo descargar la portada (${response.status})`)

  const source = Buffer.from(await response.arrayBuffer())
  return sharp(source).png().toBuffer()
}

export default getPngThumbnail