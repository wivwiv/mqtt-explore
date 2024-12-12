const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://localhost:1883')
client.on('packetreceive', (package) => {
  // console.log(package)
})

client.on('connect', () => {
  client.publish('t/ffffx', '1', {retain: true, qos: 1}, (err, package) => {
    console.log(package)
  })
})