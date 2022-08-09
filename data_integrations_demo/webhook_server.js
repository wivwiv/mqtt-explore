const http = require('http')

const mysql = require('mysql2')
const config = require('./config')

const connection = mysql.createConnection({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
  port: config.port,
})

async function handleMessage(body) {
  let data = null
  try {
    data = JSON.parse(body)
  } catch (e) {
    console.log('message not a JSON')
  }
  if (data === null) {
    return `data is null`
  }
  console.log(data)
  const event = data.event
  // 上下线记录
  if (event === 'client.connected' || event === 'client.disconnected') {
    const status = event === 'client.connected' ? 1 : 0
    // 写入 or 更新设备表
    await connection.execute(
      `INSERT INTO clients (clientid, username, ip_address, status) VALUES
    ('${data.clientid}', '${data.username}', '${data.sockname}', ${status}) ON DUPLICATE KEY UPDATE status = ${status}, ip_address = '${data.sockname}'`)
    // 插入历史表
    await connection.execute(`INSERT INTO client_events (clientid, event, topic) VALUES
    (?, ?, '')`, [data.clientid, data.event])
  } else if (event === 'message.publish') {
    // 插入消息表
    await connection.execute(`INSERT INTO messages(clientid, topic, payload) VALUES
       (?, ?, ?);`, [data.clientid, data.topic, data.payload])
  } else {
    // 订阅/取消订阅记录
    await connection.execute(`INSERT INTO client_events (clientid, event, topic) VALUES
    (?, ?, ?)`, [data.clientid, data.event, data.topic])
  }
  return `event ${event} saved ok`
}

http.createServer((req, resp) => {
  let data = ''
  req.on('data', (chunk) => {
    data += chunk
  })
  req.on('end', async () => {
    console.log(data.toString())
    const msg = await handleMessage(data.toString())
    resp.setHeader('content-type', 'application/json')
    resp.end(JSON.stringify({
      code: 0,
      msg: msg
    }))
  })
}).listen(8080, () => {
  console.log('server listen on 8080...')
})