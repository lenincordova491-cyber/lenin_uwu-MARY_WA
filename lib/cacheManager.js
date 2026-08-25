import { existsSync, unlinkSync } from 'fs'

class CacheManager {
  constructor() {
    this.cache = new Map()
  }

  agregarACache(id, filePath, expiracionMinutos = 15) {
    const anterior = this.cache.get(id)
    if (anterior) {
      clearTimeout(anterior.timeoutId)
      if (anterior.filePath !== filePath && existsSync(anterior.filePath)) {
        unlinkSync(anterior.filePath)
      }
    }

    const expiresAt = Date.now() + expiracionMinutos * 60 * 1000
    const timeoutId = setTimeout(() => {
      const entrada = this.cache.get(id)
      if (entrada?.filePath === filePath) {
        this.cache.delete(id)
        if (existsSync(filePath)) unlinkSync(filePath)
      }
    }, expiracionMinutos * 60 * 1000)
    timeoutId.unref?.()

    this.cache.set(id, { filePath, expiresAt, timeoutId })
    return filePath
  }

  obtenerDeCache(id) {
    const entrada = this.cache.get(id)
    if (!entrada) return null

    if (entrada.expiresAt <= Date.now() || !existsSync(entrada.filePath)) {
      clearTimeout(entrada.timeoutId)
      this.cache.delete(id)
      if (existsSync(entrada.filePath)) {
        unlinkSync(entrada.filePath)
      }
      return null
    }

    return entrada.filePath
  }
}

export const cacheManager = new CacheManager()
export const agregarACache = (...args) => cacheManager.agregarACache(...args)
export const obtenerDeCache = (id) => cacheManager.obtenerDeCache(id)

export function getYouTubeId(url) {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname === 'youtu.be') return parsedUrl.pathname.slice(1)
    return parsedUrl.searchParams.get('v')
  } catch {
    return null
  }
}

export default cacheManager
