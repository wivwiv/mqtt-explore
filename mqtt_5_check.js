const mqtt = require('mqtt')

const HOST = 'mqtt://broker.emqx.io:1883'

function createClient() {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect(HOST, {
      protocolVersion: 5,
      sessionExpiryInterval: 10,
      properties: {
        userProperties: {}
      }
    })
    client.on('connect', () => {
      resolve(client)
    })
  })
}

const list = [
  {
    name: '用户属性 - 连接',
    fn: () => {
      const client = mqtt.connect('')
    }
  }
]