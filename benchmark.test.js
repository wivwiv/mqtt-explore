const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://127.0.0.1:1883')

client.on('connect', () => {
  console.log('ok')
  for (let i = 0; i<=1000; i++) {
   client.publish('t/1', JSON.stringify({ "os": "centos", "hostname": "local-wivwiv" + i, "region": "yn" }))
  }
})
