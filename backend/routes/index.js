const amqp = require('amqplib')
const router = require('express').Router()

const { retry } = require('../utils/retry')
const {
  RABBITMQ_AMQP_URI,
  RABBITMQ_EXCHANGE,
  RABBITMQ_LOGGER_QUEUE,
  RABBITMQ_CONSUMER_QUEUE
} = require('../config/rabbitmq')
let ch

async function main () {
  async function makeConnection () {
    const connection = await retry(() => amqp.connect(RABBITMQ_AMQP_URI, { reconnect: true }), 20, 5000)
    connection.isOpen = true

    connection.on('close', () => {
      console.log('Rabbit connection closed! Will attempt reconnection.')
      connection.isOpen = false

      makeConnection()
        .then(() => console.log('Reconnected to rabbit.'))
        .catch(err => {
          throw new Error(err)
          // console.error('Failed to reconnect to Rabbit.')
          // console.error(err)
        })
    })

    connection.on('error', (err) => {
      console.log('Error from Rabbit:')
      console.log(err)
    })

    const channel = await connection.createChannel()
    channel.assertExchange(RABBITMQ_EXCHANGE, 'fanout', { durable: true, autoDelete: false })
    channel.assertQueue(RABBITMQ_CONSUMER_QUEUE, { durable: true, autoDelete: false })
    channel.assertQueue(RABBITMQ_LOGGER_QUEUE, { durable: true, autoDelete: false })
    ch = channel
  }

  await makeConnection()
}

router.get('/webhook', (req, res) => {
  const message = 'Hello World!!!'

  ch.publish(RABBITMQ_EXCHANGE, '', Buffer.from(message))
  return res.json({ success: true })
})

main().then(() => console.log('Publisher: online')).catch(err => {
  console.error('Publisher: offline')
  console.error(err)

  throw new Error(err)
})

module.exports = router
