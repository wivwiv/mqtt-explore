const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://139.9.180.163:1883')
client.on('connect', () => {
  client.subscribe(['t/#'], (err, granted) => {
    if (!err) {
      console.log('subscribe success', granted)
    } else {
      console.log(err, granted)
    }
  })
})

const rate = {
  msg: 0,
  bytes: 0,
  allMsg: 0,
  allBytes: 0,
}

client.on('message', (topic, payload, packet) => {
  // 统计每秒订阅消息数与 bytes 大小
  rate.msg += 1
  rate.bytes += payload.length
  rate.allMsg += 1
  rate.allBytes += payload.length
})

setInterval(() => {
  // 格式化 bytes 与 msg，人类易读
  if (rate.msg === 0) {
    rate.msg = 0
    rate.bytes = 0
    return
  }

  rate.bytes = (rate.bytes / 1024).toFixed(2) + 'KB'
  rate.msg = (rate.msg / 1000).toFixed(3) + 'K'
  rate._allBytes = (rate.allBytes / 1024).toFixed(2) + 'KB'
  rate._allMsg = (rate.allMsg / 1000).toFixed(3) + 'K'

  console.table(rate)
  rate.msg = 0
  rate.bytes = 0
}, 1000)