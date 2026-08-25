import os from 'os'

export default {
  command: ['ping', 'estado'],
  category: 'utilidad',
  run: async ({ m }) => {
    const uptime = process.uptime()
    const horas = Math.floor(uptime / 3600)
    const minutos = Math.floor((uptime % 3600) / 60)
    const segundos = Math.floor(uptime % 60)

    const ramTotal = os.totalmem() / 1024 / 1024 / 1024
    const ramLibre = os.freemem() / 1024 / 1024 / 1024
    const ramUsada = ramTotal - ramLibre

    const texto = `*🤖 ESTADO DE LENINBOT*\n\n` +
      `⏱️ *Activo:* ${horas}h ${minutos}m ${segundos}s\n` +
      `💻 *RAM Usada:* ${ramUsada.toFixed(2)} GB / ${ramTotal.toFixed(2)} GB\n` +
      `🏓 *Respuesta:* ¡Pong! Todo operando al 100%.`

    await m.reply(texto)
  },
}
