const express = require('express')
const amqp = require('amqplib/callback_api')
const app = express()
const PORT = 2000

app.get('/', (req, res) => {
  amqp.connect('amqp://kajame:111111@localhost:5672', function (error0, connection) {
    if (error0) {
      throw error0
    }

    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1
      }

      const queue = 'hello'
      const msg = 'Hello World!'

      channel.assertQueue(queue, { durable: false })
      channel.sendToQueue(queue, Buffer.from(msg))

      console.log(' [x] Sent %s', msg)

      return res.json({ success: true })
    })

    setTimeout(function () {
      connection.close()
    }, 500)
  })
})

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})
