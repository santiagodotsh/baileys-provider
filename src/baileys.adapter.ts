import makeWASocket from '@whiskeysockets/baileys'
import { useMultiFileAuthState } from '@whiskeysockets/baileys'
import { v4 as uuid } from 'uuid'
import type { WASocket } from '@whiskeysockets/baileys'
import type { Boom } from '@hapi/boom'

export class BaileysAdapter {
  private readonly makeWASocket = makeWASocket
  private readonly useMultiFileAuthState = useMultiFileAuthState

  private readonly _name = uuid()

  private sock: WASocket | undefined

  constructor() {
    this.init()
  }

  async init() {
    try {
      await this.createSock()
      await this.saveSock()
    } catch (error) {
      console.log(error)
    }
  }

  async createSock(): Promise<void> {
    const { state } = await this.useMultiFileAuthState(this._name)
    
    const sock: WASocket = this.makeWASocket({
      auth: state,
      printQRInTerminal: true
    })

    this.sock = sock
  }

  async saveSock(): Promise<void> {
    const { saveCreds } = await this.useMultiFileAuthState(this._name)

    if (this.sock) {
      this.sock.ev.on('creds.update', saveCreds)
    }
  }

  get name() {
    return this._name
  }
}
