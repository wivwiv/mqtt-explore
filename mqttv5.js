const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://127.0.0.1:1883', {
  protocolVersion: 5,
  properties: {
    userProperties: {
      role: 'admin'
   }
  }
})

client.on('connect', () => {
  client.subscribe('t/1', {
    properties: {
      userProperties: {
        from: 'subscribe'
      }
    }
  })
  console.log('connected')
  client.publish('t/1', 'hello', {
    properties: {
      userProperties: {
        userName: 'wivwiv'
      }
    }
  })
})
