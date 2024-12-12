const mqtt = require('mqtt')

const client = 
mqtt.connect('mqtt://[240e:34c:4c:f470:1:cdec:8062:7c6b]:1883', 
{
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
    retain: true,
    properties: {
      userProperties: {
        userName: 'wivwiv'
      }
    }
  }, console.log)
})
client.on('message', (topic, payload, packet) => {
  console.log(`recv msg: ${payload.toString()}`, packet)
})

client.on('packetreceive', console.log)
