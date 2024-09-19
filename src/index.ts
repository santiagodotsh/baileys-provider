import { BaileysService } from './baileys.service'

async function main() {
  const whatsapp = new BaileysService('my-session')

  try {
    await whatsapp.init()

    // const recipient = ''
    // const message = 'Hello from WhatsApp API!'

    // await whatsapp.sendMessage(recipient, message)
  } catch (error) {
    console.error('Error initializing the service:', error)
  }
}

main()
