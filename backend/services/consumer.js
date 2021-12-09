const { startMessaging } = require('../utils/makeConnection')
const { RABBITMQ_EXCHANGE, RABBITMQ_CONSUMER_QUEUE } = require('../config/rabbitmq')

async function consumer () {
  startMessaging(async messagingConnection => {
    const channel = await messagingConnection.createChannel()
    channel.bindQueue(RABBITMQ_CONSUMER_QUEUE, RABBITMQ_EXCHANGE, '')
    channel.consume(RABBITMQ_CONSUMER_QUEUE, async function (msg) {
      if (msg.content) {
        console.log(`[x] Consumer working: ${msg.content.toString()}`)
      }
    }, { noAck: true })
  })
}

consumer().then(() => console.log('Consumer: online')).catch(err => {
  console.error('Consumer: offline')
  console.error(err)

  throw new Error(err)
})

module.exports = consumer
