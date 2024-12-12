const mqtt = require('mqtt')
const fs = require('fs')
let FILE_PATH = process.argv[2] || './static/emqx-logo.png'
console.log(FILE_PATH)
const client = mqtt.connect('mqtt://localhost:1883')

client.subscribe('t/#')

client.publish(
  `t/${Math.random().toString().slice(3,8)}.png`, 

  // 读取图片文件发布
  fs.readFileSync(FILE_PATH), 
  {qos:1},
  () => { 
    console.log(arguments)
    console.log('file send success'
  ) }
)
client.on('message', (topic, payload) => {
  console.log('Recv file:')
  const savePath = './static/' + topic.split('/').pop()
  console.table({
    topic,
    size: Buffer.byteLength(payload),
    savePath,
  })
  fs.writeFileSync(savePath, payload)
  console.log(`Now you can view file: ${savePath}`)
})
