const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://localhost:1883', {
  username: 'emqx_u',
  password: 'public',
  protocolVersion: 5,
  properties: {
    authenticationMethod: 'SCRAM-SHA-1',
    authenticationData: Buffer.from('jsx'),
    userProperties: {
      msg: 'hello'
    }
  }
})

client.on('connect', () => {
  console.log('connected')
})

client.on('error', (error) => {
  console.log(`error ${error}`)
})

client.on('reconnect', () => {
  console.log(`reconnecting`)
})