const express = require('express')
const bodyParser = require('body-parser')
const WebSocket = require('ws')
const { spawn } = require('child_process')

const app = express()
const { log } = console

const server = app.listen(9898, '0.0.0.0', () => {
  const { address, port } = server.address()
  log(`Server listening at http://localhost:${port}`)
})

const wss = new WebSocket.Server({ server })

const peers = []
const responses = []

const shutdown = () => {
  log('Shuting down the server...')
  wss.close()
  server.close()
}

app.use(bodyParser.text({type: '*/*'}))

// Send message to WebSocket (broadcasting)
app.post('/sendAsync', (req, res) => {
  const msg = req.body
  log('/sendAsync:', msg)

  // Send WS message to all peers (broadcasting)
  peers.map(ws => ws.send(`${msg}`))

  res.send('OK')

  msg === 'EXIT' && shutdown()
})

// Long-polling http connection
app.post('/send', (req, res) => {
  const msg = req.body
  log('/send:', msg)

  // Save response call
  responses.push(x => res.send(x))

  msg === 'EXIT' && shutdown()
})

// WebSocket connection
wss.on('connection', function connection(ws) {
  peers.push(ws)

  ws.on('message', function incoming(msg) {
    responses.forEach(send => {
      send(msg)
    })
    responses.length = 0

    msg === 'EXIT' && shutdown()
  })
})
