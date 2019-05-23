const url = 'ws://localhost:9898'

const { log } = console

const startWS = ({onopen, onclose, onmessage}) => {
  const ws = () => {
    const connection = new WebSocket(url)

    connection.onopen = onopen

    connection.onclose = () => {
      onclose && onclose()
      // Try reconnect
      const ms = 2e3
      log(`Reconnect in ${ms/1e3} sec`)
      setTimeout(ws, ms)
    }

    connection.onmessage = onmessage
  }
  ws()
}

window.addEventListener('DOMContentLoaded', (event) => {
  const connEl  = document.getElementById("conn")
  const msgsEl  = document.getElementById("msgs")
  const mEl     = document.getElementById("txtMsg")
  const btnSend = document.getElementById("btnSend")
  let ws

  mEl.focus()

  const sendMsg = () => {
    ws.send(mEl.value)
  }

  const prependMsg = msg => {
    const me = document.createElement("div")
    me.innerHTML = msg
    msgsEl.prepend(me)
  }

  btnSend.addEventListener('click', sendMsg)

  mEl.addEventListener('keypress', ev => {
    ev.ctrlKey && ev.which === 10 &&
      (ev.stopPropagation(), sendMsg())
  })

  const onopen = ev => {
    connEl.innerHTML = 'Connected!'
    connEl.style.backgroundColor = 'green'
    ws = ev.target
  }

  const onclose = () => {
    connEl.innerHTML = 'Disconnected!'
    connEl.style.backgroundColor = '#d10f0f'
  }

  const toJson = str => {
    try { return JSON.parse(str) }
    catch (_) { return str }
  }

  const onmessage = e => {
    log('MSG:', e.data)
    prependMsg(e.data)

    const msg = toJson(`${e.data}`)
    if (msg.color) {
      log('COLOR:', msg.color)
      msgsEl.style.backgroundColor = msg.color
    }
  }

  startWS({onopen, onclose, onmessage})
})
