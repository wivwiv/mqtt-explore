const mqtt = require('mqtt')

// 获取命令行的第一个参数
const args = process.argv.slice(2)
const broker = {
  hivemq: 'broker.hivemq.com',
  emqx: 'broker.emqx.io',
  mosquitto: 'test.mosquitto.org',
  local: 'localhost',
}

if (!broker[args[0]]) {
  console.log('Error: Please specify a valid broker:' + Object.keys(broker).join(', '))
  return
}

// 连接 MQTT 服务器
const host = 'mqtt://' + broker[args[0]] + ':1883'
console.log(host)
const client = mqtt.connect(host)
client.on('connect', () => {
  console.log('Connected to ' + broker[args[0]])
  client.subscribe('+/#', (error) => {
    if (!error) {
      console.log('Subscribe successfully!')
      setInterval(() => {
        const m = metric
        // 使用 table 输出，并格式化为 KB/MB/GB
        console.table({
          'msgNumber/s': m.msgNumber / 10,
          'msgNumberAll': m.msgNumberAll,
          'msgSize/s': (m.msgSize / 1024 / 10).toFixed(2) + 'KB',
          'msgSizeAll': (m.msgSizeAll / 1024).toFixed(2) + 'KB',
        })
        metric.msgNumber = 0
        metric.msgSize = 0
      }, 10 * 1000)
    } else {
      console.log('Subscribe failed!')
    }
  })
})


// 统计每秒钟消息条数以及消息流量，累计消息流量
let metric = {
  msgNumber: 0,
  msgNumberAll: 0,
  msgSize: 0,
  msgSizeAll: 0,
}
client.on('message', function (topic, message) {
  metric.msgNumber++
  metric.msgNumberAll++
  metric.msgSize += message.length
  metric.msgSizeAll += message.length
})

