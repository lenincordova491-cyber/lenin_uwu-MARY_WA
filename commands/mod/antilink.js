import { getGroupConfig, toggleAntilink } from '../../lib/groupManager.js'

export default {
  command: 'antilink',
  category: 'moderacion',
  run: async ({ m, args }) => {
    if (!m.isGroup) {
      return m.reply('✎ Este comando solo funciona dentro de un grupo.')
    }

    if (!m.isAdmin) {
      return m.reply('✘ Solo los administradores pueden cambiar el Antilink.')
    }

    const action = args[0]?.toLowerCase()
    if (action !== 'on' && action !== 'off') {
      const status = getGroupConfig(m.chat).antilink ? 'activado' : 'desactivado'
      return m.reply(`✎ Uso: *.antilink on* o *.antilink off*\nEstado actual: *${status}*.`)
    }

    const enabled = action === 'on'
    toggleAntilink(m.chat, enabled)
    return m.reply(`✅ Antilink ${enabled ? 'activado' : 'desactivado'} en este grupo.`)
  },
}
