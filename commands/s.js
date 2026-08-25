import { downloadMediaMessage } from '@whiskeysockets/baileys'
import sharp from 'sharp'

function getImageMessage(m) {
  if (m.message?.imageMessage) return m.rawMessage

  const quoted = m.message?.extendedTextMessage?.contextInfo
  if (quoted?.quotedMessage?.imageMessage) {
    return {
      key: {
        remoteJid: m.chat,
        fromMe: false,
        id: quoted.stanzaId,
        participant: quoted.participant,
      },
      message: quoted.quotedMessage,
    }
  }

  return null
}

export default {
  command: ['s', 'stiker', 'sticker'],
  category: 'convertidores',
  run: async ({ client, m }) => {
    const imageMessage = getImageMessage(m)
    if (!imageMessage) {
      return m.reply('✎ Enviá una imagen con *.s* en el caption o respondé a una imagen con *.s*.')
    }

    try {
      await client.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

      const image = await downloadMediaMessage(imageMessage, 'buffer', {}, {
        logger: client.logger,
      })
      const sticker = await sharp(image).webp({ quality: 85 }).toBuffer()

      await client.sendMessage(
        m.chat,
        { sticker, mimetype: 'image/webp' },
        { quoted: m.rawMessage || m }
      )

      await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (error) {
      console.error('[sticker]', error)
      await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      await m.reply('✘ No se pudo convertir la imagen en sticker.')
    }
  },
}