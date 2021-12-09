const router = require('express').Router()

const {
  RABBITMQ_EXCHANGE,
  RABBITMQ_LOGGER_QUEUE,
  RABBITMQ_CONSUMER_QUEUE
} = require('../config/rabbitmq')
const { startMessaging } = require('../utils/makeConnection')
let ch

async function main () {
  startMessaging(async connection => {
    const channel = await connection.createChannel()
    channel.assertExchange(RABBITMQ_EXCHANGE, 'fanout', { durable: true, autoDelete: false })
    channel.assertQueue(RABBITMQ_CONSUMER_QUEUE, { durable: true, autoDelete: false })
    channel.assertQueue(RABBITMQ_LOGGER_QUEUE, { durable: true, autoDelete: false })
    ch = channel
  })
}

router.get('/webhook', (req, res) => {
  const message = 'Hello World!!!'
  console.log(`send message: ${message}`)

  ch.publish(RABBITMQ_EXCHANGE, '', Buffer.from(message))
  return res.json({ success: true })
})

main().then(() => console.log('Publisher: online')).catch(err => {
  console.error('Publisher: offline')
  console.error(err)

  throw new Error(err)
})

module.exports = router
