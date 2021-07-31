const mqtt = require('mqtt')

const URL = 'mqtt://broker.emqx.io'
const TOPIC = '+/#'

const client = mqtt.connect(URL)

client.on('connect', () => {
  client.subscribe(TOPIC, () => {
    console.log('SUB')
  })
})

const d = {
  num: 0,
  all_num: 0,
  size: 0,
  all_size: 0,
}

client.on('message', (topic, payload) => {
  d.num += 1
  d.all_num += 1
  d.size += payload.byteLength
  d.all_size += payload.byteLength
})

setInterval(() => {
  console.log(`消息数: ${d.all_num} 消息平均大小: ${(d.size / d.num).toFixed(2)} Bytes`)
  d.num = 0
  d.size = 0
}, 5000)

a.forEach(f => {
  var c = fs.readFileSync(path.join('./', f)).toString(); 
  var list = c.match(/https:\/\/cdn.bigpar.cn.*?(gif|png|jpg)/gi)
  if (list) {
    list.forEach(url => {
      const fileName = url.split('/').pop()
      const file = path.join('/Users/emqtt/workspace/common-web-site/images', fileName)
      down(url, file)
      const imgUrl = `https://common-site.now.sh/images/${fileName}`
      // replace
      c = c.replace(new RegExp(url, 'gim'), imgUrl)
    }) 
  }
  fs.writeFileSync(path.join('./', f), c)
})