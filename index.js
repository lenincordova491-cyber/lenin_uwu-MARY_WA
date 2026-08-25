import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import { createHandler } from './handler.js'
import settings from './settings.js'

let reconnectScheduled = false

process.on('unhandledRejection', (reason) => {
  const statusCode = new Boom(reason)?.output?.statusCode
  if (statusCode === 428 || reason?.message === 'Connection Closed') return
  console.error('✎ Promesa no controlada:', reason)
})

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version } = await fetchLatestBaileysVersion()

  const client = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
  })
  let pairingRequested = false

  client.ev.on('creds.update', saveCreds)

  client.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (!state.creds.registered && settings.pairingNumber && connection === 'connecting' && !pairingRequested) {
      pairingRequested = true
      setTimeout(async () => {
        try {
          const code = await client.requestPairingCode(settings.pairingNumber)
          console.log(`\n✎ Código de vinculación: ${code}`)
          console.log('Abrí WhatsApp > Dispositivos vinculados > Vincular con número de teléfono.\n')
        } catch (error) {
          console.error('✎ No se pudo generar el código de vinculación:', error)
        }
      }, 3000)
    }

    if (qr) {
      console.log('\n✎ Escaneá este QR con WhatsApp (Dispositivos vinculados):\n')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      console.log('✎ Conexión cerrada.', shouldReconnect ? 'Reconectando...' : 'Sesión cerrada, borrá ./session y volvé a escanear el QR.')
      if (shouldReconnect && !reconnectScheduled) {
        reconnectScheduled = true
        setTimeout(() => {
          reconnectScheduled = false
          start().catch((error) => console.error('✎ Error al reconectar:', error))
        }, 3000)
      }
    } else if (connection === 'open') {
      console.log(`✎ ${settings.botName} conectado correctamente.`)
    }
  })

  await createHandler(client)
}

start().catch((err) => console.error('✎ Error fatal al iniciar el bot:', err))
