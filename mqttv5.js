const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://broker.emqx.io:1883', {
  protocolVersion: 5,
  properties: {
    userProperties: {
      id: '6281C554-3F33-4065-90C2-57EF7E3228C3',
      password: 'public',
    }
  }
})

client.on('connect', () => {
  client.subscribe('t/1', {
    qos: 2
  })
  console.log('connected')
  client.publish('t/1', 'hello', {
    qos: 2,
    properties: {
      userProperties: {
        userName: 'wivwiv'
      }
    }
  })
})
client.on('message', (topic, payload, packet) => {
  console.log(`recv msg: ${payload.toString()}`, packet)
})