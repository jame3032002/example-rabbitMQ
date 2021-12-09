const { startMessaging } = require('../utils/makeConnection')
const { RABBITMQ_EXCHANGE, RABBITMQ_LOGGER_QUEUE } = require('../config/rabbitmq')

async function logger () {
  startMessaging(async messagingConnection => {
    const channel = await messagingConnection.createChannel()
    channel.bindQueue(RABBITMQ_LOGGER_QUEUE, RABBITMQ_EXCHANGE, '')
    channel.consume(RABBITMQ_LOGGER_QUEUE, async function (msg) {
      if (msg.content) {
        console.log(`[x] Save log to mongoDB: ${msg.content.toString()}`)
      }
    }, { noAck: true })
  })
}

logger().then(() => console.log('Logger: online')).catch(err => {
  console.error('Publisher: offline')
  console.error(err)

  throw new Error(err)
})

module.exports = logger
