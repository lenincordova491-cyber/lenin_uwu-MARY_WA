import 'dotenv/config'

export const settings = {
  prefix: process.env.BOT_PREFIX || '.',
  botName: process.env.BOT_NAME || 'MARY_WA',
  pairingNumber: process.env.PAIRING_NUMBER || '',
  ownerNumber: (process.env.OWNER_NUMBER || '').replace(/[^0-9]/g, ''),
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID || '',
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',

  // Solo se usan si algún comando pega a NyxDLaPI (ver .env.example)
  nyxBase: process.env.NYX_BASE || 'https://nyxdlapi.vercel.app',
  nyxApiKey: process.env.NYX_API_KEY || '',
}

export default settings
