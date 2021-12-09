const amqp = require('amqplib/callback_api')

amqp.connect('amqp://kajame:111111@localhost:5672', function (error0, connection) {
  if (error0) {
    throw error0
  }

  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1
    }

    const queue = 'task_queue'

    // This makes sure the queue is declared before attempting to consume from it
    channel.assertQueue(queue, { durable: true })
    channel.consume(queue, function (msg) {
      const secs = Math.floor(Math.random() * 10) // msg.content.toString().split('-')[1]
      console.log(' [x] Received %s %d', msg.content.toString(), secs)

      setTimeout(function () {
        console.log(' [x] Done')
      }, secs * 1000)
    }, { noAck: true })
  })
})
