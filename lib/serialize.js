import settings from '../settings.js'

/**
 * Convierte un mensaje crudo de Baileys en un objeto "m" simple
 * con .chat, .sender, .text, .args, .reply(), etc.
 * Esto evita repetir lógica de parseo en cada comando.
 */
export function serializeMessage(client, rawMsg) {
  const msg = rawMsg.messages?.[0]
  if (!msg || !msg.message) return null

  const chat = msg.key.remoteJid
  const fromMe = msg.key.fromMe
  const sender = msg.key.participant || msg.key.remoteJid
  const isGroup = chat?.endsWith('@g.us') || false

  const type = Object.keys(msg.message)[0]
  const body =
    msg.message.conversation ||
    msg.message.extendedTextMessage?.text ||
    msg.message.imageMessage?.caption ||
    msg.message.videoMessage?.caption ||
    ''

  const prefix = settings.prefix
  const isCmd = body.startsWith(prefix)
  const commandBody = isCmd ? body.slice(prefix.length).trim() : ''
  const [commandName, ...args] = commandBody.split(/\s+/)
  const text = args.join(' ')
  const isOwner =
    fromMe ||
    (settings.ownerNumber && sender.startsWith(settings.ownerNumber))

  return {
    key: msg.key,
    rawMessage: msg,
    message: msg.message,
    participant: msg.participant,
    chat,
    sender,
    fromMe,
    isOwner,
    isGroup,
    isAdmin: false,
    type,
    body,
    isCmd,
    command: (commandName || '').toLowerCase(),
    args,
    text,
    reply: (content) => client.sendMessage(chat, { text: content }, { quoted: msg }),
  }
}

export default serializeMessage
