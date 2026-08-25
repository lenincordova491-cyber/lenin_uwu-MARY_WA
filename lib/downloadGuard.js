import { checkCooldown } from './cooldown.js'
import { downloadQueue } from './queue.js'

export function guardDownload(commandName, run, { cooldownSeconds = 10 } = {}) {
  return async function guardedDownload(ctx) {
    const { m } = ctx
    const remainingSeconds = checkCooldown(commandName, m.sender, cooldownSeconds)

    if (remainingSeconds > 0) {
      return m.reply(`⏳ Esperá ${remainingSeconds} segundos antes de volver a usar .${commandName}.`)
    }

    return downloadQueue.add(() => run(ctx))
  }
}
