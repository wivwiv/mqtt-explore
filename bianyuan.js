const mqtt = require('mqtt')

const client = mqtt.connect('ws://123.60.46.48:8083/mqtt', {
  username: 'emqx',
  password: 'public'
})

client.on('connect', () => {
  console.log('connect')
  console.log(client)
  client.subscribe('emq/facecount', console.log)
  client.on('message', console.log)
  const clientList = new Array(10).map($ => Math.random().toString(16).slice(4, 8))
  setInterval(() => {
    clientList.forEach(id => {
      const p = JSON.parse({ uuid: id, avgCount: Math.floor(Math.random() * 100) })
      client.publish('emq/facecount', p, console.log, console.log)
    })
    console.log('send', clientList.length)
  }, 2000)
})


