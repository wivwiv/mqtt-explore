const mqtt = require('mqtt')
const fs = require('fs')

const client = mqtt.connect('mqtt://broker.emqx.io:1883')

client.subscribe('file/t/1')
client.publish('file/t/1', fs.readFileSync('./static/emqx-logo.png'), () => {
  console.log('file send success')
})
client.on('message', (topic, payload) => {
  if (topic === 'file/t/1') {
    fs.writeFileSync(`./static/file-emqx-logo.png`, payload)
    console.log('recv file, please open to view.')
  }
})
