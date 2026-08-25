import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import settings from './settings.js'
import { serializeMessage } from './lib/serialize.js'
import { getGroupConfig } from './lib/groupManager.js'

const COMMANDS_DIR = path.resolve('./commands')
const URL_RE = /(?:https?:\/\/|www\.|wa\.me\/|chat\.whatsapp\.com\/|t\.me\/|discord\.gg\/)[^\s]+/i

async function setAdminStatus(client, m) {
  if (!m.isGroup) return

  try {
    const metadata = await client.groupMetadata(m.chat)
    const participant = metadata.participants.find(({ id }) => id === m.sender)
    m.isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin'
  } catch (error) {
    console.error('[handler] No se pudo consultar los administradores:', error.message)
  }
}

/**
 * Recorre commands/ (y subcarpetas como commands/dow/) y carga
 * cada archivo .js como un comando. Devuelve un Map: nombre -> módulo
 */
async function loadCommands(dir = COMMANDS_DIR) {
  const map = new Map()

  async function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        await walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        const mod = await import(pathToFileURL(fullPath).href)
        const cmd = mod.default
        if (!cmd?.command) continue
        const aliases = Array.isArray(cmd.command) ? cmd.command : [cmd.command]
        for (const alias of aliases) {
          map.set(alias.toLowerCase(), cmd)
        }
      }
    }
  }

  await walk(dir)
  return map
}

export async function createHandler(client) {
  const commands = await loadCommands()
  console.log(`✎ ${commands.size} comandos cargados.`)

  client.ev.on('messages.upsert', async (rawMsg) => {
    try {
      const m = serializeMessage(client, rawMsg)
      if (!m) return

      if (m.isGroup) {
        const config = getGroupConfig(m.chat)
        if (config.antilink) {
          await setAdminStatus(client, m)
          if (!m.isAdmin && !m.isOwner && URL_RE.test(m.body)) {
            await client.sendMessage(m.chat, { delete: m.key })
            await client.sendMessage(m.chat, {
              text: `✘ @${m.sender.split('@')[0]} no se permiten enlaces en este grupo.`,
              mentions: [m.sender],
            })
            return
          }
        } else if (m.isCmd && m.command === 'antilink') {
          await setAdminStatus(client, m)
        }
      }

      if (!m.isCmd || (!m.isOwner && m.command !== 'antilink')) return

      const cmd = commands.get(m.command)
      if (!cmd) return

      console.log(`[cmd] ${settings.prefix}${m.command} ← ${m.sender}`)
      await cmd.run({ client, m, args: m.args, text: m.text })
    } catch (err) {
      console.error('[handler] Error procesando mensaje:', err)
    }
  })

  return commands
}

export default createHandler
