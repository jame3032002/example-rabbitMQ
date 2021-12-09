const amqp = require('amqplib')

const { retry } = require('./retry')
const { RABBITMQ_AMQP_URI } = require('../config/rabbitmq')

async function startMessaging (onConnection) {
  async function makeConnection () {
    const messagingConnection = await retry(() => amqp.connect(RABBITMQ_AMQP_URI, { reconnect: true }), 1000, 5000)
    messagingConnection.isOpen = true

    messagingConnection.on('close', () => {
      console.log('Rabbit connection closed! Will attempt reconnection.')
      messagingConnection.isOpen = false

      makeConnection()
        .then(() => console.log('Reconnected to rabbit.'))
        .catch(err => {
          console.error('Failed to reconnect to Rabbit.')
          console.error(err)
        })
    })

    messagingConnection.on('error', (err) => {
      console.log('Error from Rabbit:')
      console.log(err)
    })

    const promise = onConnection(messagingConnection)
    if (promise) {
      promise.then(() => console.log('Connection callback completed.'))
        .catch(err => {
          console.error('Error running client connection callback.')
          console.error(err)
        })
    } else {
      console.log('Connection callback completed.')
    }
  }

  await makeConnection()
}

module.exports = {
  startMessaging
}
