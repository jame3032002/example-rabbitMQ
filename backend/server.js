const express = require('express')
const app = express()
const PORT = process.env.PORT || 2000
const SERVICE_NAME = process.env.SERVICE_NAME || 'publisher'

switch (SERVICE_NAME) {
  case 'logger':
    require('./services/logger')
    break
  default:
    app.use('/api', require('./routes'))
    break
}

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})
