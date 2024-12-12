const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://localhost:1883', {
  protocolVersion: 5,
})

client.on('connect', () => {
  console.log('connected')
  client.subscribe('t/2')
  setInterval(() => {
    client.publish('t/1', 'hello mqtt 5.0', {
      properties: {
        messageExpiryInterval: 100,
        contentType: 'JSON',
        userProperties: {
          ts: Date.now(),
        }
      }
    })
    console.log('publish')
  }, 1000)
})


client.on('message', (topic, message, packet) => {
  console.log(`recv msg from ${topic}: ${message.toString()}`)
  delete packet.payload
  console.log(`packet: ${JSON.stringify(packet)}`)
})
