import * as baileys from '@whiskeysockets/baileys'
import type { Boom } from '@hapi/boom'

export class BaileysService {
  private conn: baileys.WASocket | null = null
  private retries: number = 0

  constructor(private readonly session: string) {}

  public async init(): Promise<void> {
    await this.startConn()
  }

  private async startConn(): Promise<void> {
    try {
      const { state, saveCreds } = await baileys.useMultiFileAuthState(this.session)

      this.conn = baileys.default({
        auth: state,
        printQRInTerminal: true
      })

      this.conn.ev.on('connection.update', this.handleConnectionUpdate.bind(this))

      this.conn.ev.on('creds.update', saveCreds)

      console.log('Connection initialized successfully')
    } catch (error) {
      console.error('Failed to start connection:', error)
      
      throw new Error('Connection initialization failed')
    }
  }

  private async handleConnectionUpdate(update: Partial<baileys.ConnectionState>): Promise<void> {
    const { connection, lastDisconnect } = update

    if (connection === 'close') {
      const lastError = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode
      const shouldReconnect = lastError !== baileys.DisconnectReason.loggedOut

      console.log('Connection closed, reconnecting...', shouldReconnect)

      if (shouldReconnect && this.retries < 5) {
        this.retries++

        await this.startConn()
      } else {
        console.log('Max reconnection attempts reached or logged out.')
      }
    } else if (connection === 'open') {
      console.log('Connection opened successfully')

      this.retries = 0
    }
  }

  // public async sendMessage(to: string, message: string): Promise<void> {
  //   if (!this.conn) {
  //     throw new Error('Connection is not initialized')
  //   }

  //   if (this.conn.ws.readyState !== WebSocket.OPEN) {
  //     console.log('WebSocket is not open. Reconnecting...')

  //     await this.startConn()
  //   }

  //   try {
  //     const jid = `${to}@s.whatsapp.net`

  //     const response = await this.conn.sendMessage(jid, { text: message })

  //     console.log('Message sent successfully:', response)
  //   } catch (error) {
  //     console.error('Failed to send message:', error)

  //     throw new Error('Message sending failed')
  //   }
  // }

  public async logout(): Promise<void> {
    if (this.conn) {
      await this.conn.logout()

      console.log('Logged out successfully')
    } else {
      console.log('No active connection to log out')
    }
  }
}
