export function withTimeout(promise, ms) {
  let timeoutId

  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`La operación superó el límite de ${ms} ms`))
    }, ms)
  })

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId))
}
