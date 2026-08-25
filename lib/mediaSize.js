export async function getRemoteSize(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const length = response.headers.get('content-length')
    if (length) return formatSize(Number(length))
  } catch {}

  return 'desconocido'
}

export async function downloadRemote(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`No se pudo descargar el archivo (${response.status})`)
  return Buffer.from(await response.arrayBuffer())
}

export function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return 'desconocido'
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default getRemoteSize