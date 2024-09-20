import { BaileysService } from './baileys.service'

const whatsapp1 = new BaileysService({ name: 'chatbot' })
const whatsapp2 = new BaileysService({ name: 'chatbot2' })

async function main() {
  try {
    await whatsapp1.sendMessage()
    await whatsapp2.sendMessage()
  } catch (error) {
    console.error(error)
  }
}

main()
