import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'
import { Alert, Layout, Button, Menu, Dropdown } from 'antd'
import { DownCircleTwoTone } from '@ant-design/icons'
import TextArea from 'antd/lib/input/TextArea';

// Import Ant Design styles
import '../node_modules/antd/dist/antd.css'

import './index.less'

const { Header, Content, Footer, Sider } = Layout

const { log } = console

const socketUrl = 'ws://localhost:9898'

const startWS = ({url, onopen, onclose, onmessage}) => {
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
    return connection
  }
  return ws()
}

const SocketConnection = ({text, isOn}) => {
  const ty = isOn ? 'success': 'error'
  return <>
    <label>RNode WebSocket connection</label>
    <Alert message={text} type={ty} showIcon />
  </>
}

const examples = [
  ['Simple echo message', '{"echo": "Hi from web client!"}'],
  ['Execute http request from RNode', '{"url": "http://node1.testnet.rchain-dev.tk:40403/status"}'],
  ['Send echo with client command', '{"echo": {"color": "orange"}}'],
  ['Execute Rholang term (print to RNode console)', 'new out(`rho:io:stdout`) in { out!("Print this from JS!") }'],
  ['EXIT - stop RNode long-polling & nodejs server', 'EXIT'],
]

const MenuExamples = ({clicked}) => {
  const menu =
    <Menu onClick={({key}) => clicked(key)}>
      {examples.map(([name, code], i) =>
        <Menu.Item key={code}>{name}</Menu.Item>
      )}
    </Menu>
  return <>
    <Dropdown overlay={menu}>
      <a className="ant-dropdown-link" href="#">
        Examples <DownCircleTwoTone />
      </a>
    </Dropdown>
  </>
}

const SendMessage = ({msg, setMsg, sendMsg, setCode}) => {
  const tbxOnKeyPress = ev => { ev.ctrlKey && ev.which === 13 && sendMsg() }
  return <>
    <TextArea autoFocus onKeyPress={tbxOnKeyPress} placeholder="Send message to RNode"
      rows={5} style={{ width: '100%' }} value={msg} onChange={ev => setMsg(ev.target.value)} />
    <p></p>
    <Button onClick={sendMsg}>Send <sub>Ctrl+Enter</sub></Button>&nbsp;&nbsp;
    <MenuExamples clicked={setMsg} />
  </>
}

const Main = () => {
  const [[conn, isOn], setConn] = useState(['Disconnected!', false])
  const [msg, setMsg] = useState('')
  const [ws, setWs] = useState(null)
  const [msgList, setMsgList] = useState([])
  const [bg, setBg] = useState('')
  let msgs = []

  useEffect(() => {
    const socket = startWS({url: socketUrl, onopen, onclose, onmessage})
    setWs(socket)
  }, [])

  const sendMsg = () => { ws.send(msg) }

  const onopen = ev => {
    setWs(ev.target)
    setConn(['Connected!', true])
  }

  const onclose = () => { setConn(['Disconnected!', false]) }

  const toJson = str => {
    try { return JSON.parse(str) }
    catch (_) { return str }
  }

  const onmessage = e => {
    log('MSG:', e.data)

    // TODO: msgList is empty??
    msgs = [e.data, ...msgs]
    setMsgList(msgs)

    const { color } = toJson(`${e.data}`)
    color && setBg(color)
  }

  return <>
    <Layout>
      <Content style={{ padding: '10px' }}>
        <SocketConnection text={conn} isOn={isOn} />
        <p></p>
        <SendMessage msg={msg} setMsg={setMsg} sendMsg={sendMsg} />
        <p></p>
        <div className="status" style={{backgroundColor: bg}}>
          {msgList.map((x, i) => <div key={i}>{x}</div>)}
        </div>
        <h1>SDGFDSF S F</h1>
        <p>sdfsfsdfd</p>
      </Content>
    </Layout>
  </>
}

render(<Main />, document.getElementById('app'))
