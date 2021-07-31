const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://127.0.0.1:1883', {
  protocolVersion: 5
})

client.on('connect', () => {
  console.log('connected')
  client.subscribe('t/+', () => {
    console.log('sub success')
  })
  client.publish('t/1', 'hello', {
    properties: {
      userProperties: {
        userName: 'wivwiv'
      }
    }
  })
})

client.on('message', (topic, payload, packet) => {
  console.log(packet)
})