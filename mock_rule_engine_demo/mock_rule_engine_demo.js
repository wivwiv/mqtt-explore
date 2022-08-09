const mqtt = require('mqtt')

const HOST_URL = 'mqtt://localhost:1883'

function createCliet(clientId) {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect(HOST_URL, {
      clientId,
      username: clientId,
    })
    client.on('connect', () => {
      client.clientId = clientId
      resolve(client)
    })
    client.on('error', (error) => {
      reject(new Error(error))
    })
    client.on('reconnect', () => {
      console.log(`${clientId} reconnecting...`)
    })
  })
}

function subOrnsub(client, sub = true) {
  if (!client || !client.connected) {
    return
  }
  if (sub) {
    client.subscribe('t/0', { qos: 0 })
    client.subscribe('t/1', { qos: 1 })
    client.subscribe('t/2', { qos: 0 })
    if (Math.random() > 0.6) {
      const denyTopic = `deny_sub_topic/${Math.floor(Math.random() * 10)}`
      client.subscribe(denyTopic, { qos: 0 })
      console.log(`${client.clientId} sub deny topic ok`)
    }
  } else {
    client.unsubscribe('t/0')
    client.unsubscribe('t/1')
    client.unsubscribe('t/2')
  }
}

// 模拟连接、订阅、取消订阅、发布数据、认证鉴权失败
async function mockAll() {
  const clients = []
  for (let i = 0; i <= 9; i++) {
    const client = await createCliet(`client_${i}`)
    clients.push(client)
    subOrnsub(client)
  }
  function getRandomClient() {
    const index = Math.floor(Math.random() * clients.length)
    const c = clients[index]
    return c
  }
  // 随机行为
  setInterval(() => {
    const client = getRandomClient()
    // 取消订阅
    subOrnsub(client, false)
    // 重新订阅
    setTimeout(() => {
      subOrnsub(client, true)
      console.log(`${client.clientId} resub ok`)
    }, 2000)

    client.end()
    setTimeout(() => {
      client.reconnect()
      console.log(`${client.clientId} reconnect ok`)
    }, 1500)
  }, 5000)
  // 定时行为
  setInterval(() => {
    clients.forEach(client => {
      if (client && client.connected) {
        client.publish(`sensor/data`, JSON.stringify({
          temp: Number((Math.random() * 50).toFixed(2)),
          hum: Number((Math.random() * 70).toFixed(2)),
          clientId: client.clientId,
          ts: Date.now()
        }))
      }
    })
  }, 3000)
}

mockAll()