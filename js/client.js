const WebSocket = require('ws')

const ws = new WebSocket('ws://localhost:9898')

const [x, y, msg] = process.argv

ws.on('open', function open() {
  process.stdin.setEncoding('utf8')

  const readListener = data => {
    const command = data.replace('\n', '')

    ws.send(command)

    command === 'EXIT' && process.exit()
  }

  process.stdin.on('data', readListener)
})

ws.on('message', function incoming(data) {
  console.log(data)
})
