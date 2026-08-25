const cooldowns = new Map()

export function checkCooldown(command, sender, seconds = 10) {
  const key = `${command}:${sender}`
  const now = Date.now()
  const expiresAt = cooldowns.get(key) || 0

  if (expiresAt > now) {
    return Math.ceil((expiresAt - now) / 1000)
  }

  cooldowns.set(key, now + seconds * 1000)
  return 0
}
