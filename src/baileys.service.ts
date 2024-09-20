import makeWASocket from '@whiskeysockets/baileys'
import { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys'
import type { ConnectionState, proto, WASocket } from '@whiskeysockets/baileys'
import type { Boom } from '@hapi/boom'

export class BaileysService {
  private conn: WASocket | null = null
  private retries: number = 0
  private readonly name: string

  constructor({ name }: { name: string }) {
    this.name = name
  }

  private async startConn(): Promise<WASocket> {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.name)

      const conn = makeWASocket({
        auth: state,
        printQRInTerminal: true
      })

      conn.ev.on('connection.update', this.handleConnection.bind(this))

      conn.ev.on('creds.update', saveCreds)

      console.log('Connection initialized successfully')

      return conn
    } catch (error) {
      console.error('Failed to start connection:', error)
      
      throw new Error('Connection initialization failed')
    }
  }

  private async handleConnection(update: Partial<ConnectionState>): Promise<void> {
    const { connection, lastDisconnect } = update

    if (connection === 'close') {
      const lastError = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode
      const shouldReconnect = lastError !== DisconnectReason.loggedOut

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

  public async sendMessage(): Promise<void> {
    try {
      const conn = await this.startConn()

      conn.ev.on("messages.upsert", async ({ messages, type }) => {
        try {
          if (type === "notify") {
            if (!messages[0]?.key.fromMe) {
              const captureMessage = messages[0]?.message?.conversation;
              const numberWa = messages[0]?.key?.remoteJid;
    
              const compareMessage = captureMessage?.toLowerCase()
    
              if (compareMessage === "ping") {
                await conn.sendMessage(
                  numberWa as string,
                  {
                    text: "Pong",
                  },
                  {
                    quoted: messages[0],
                  }
                );
              } else {
                await conn.sendMessage(
                  numberWa as string,
                  {
                    text: "Soy un robot",
                  },
                  {
                    quoted: messages[0],
                  }
                )
              }
            }
          }
        } catch (error) {
          console.log("error ", error)
        }
      })

      console.log('Message sent successfully')
    } catch (error) {
      console.error('Failed to send message:', error)

      throw new Error('Message sending failed')
    }
  }

  public async logout(): Promise<void> {
    if (this.conn) {
      await this.conn.logout()

      console.log('Logged out successfully')
    } else {
      console.log('No active connection to log out')
    }
  }
}
