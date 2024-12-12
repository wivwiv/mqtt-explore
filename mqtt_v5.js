const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://broker.emqx.io:1883', {
  protocolVersion: 5,
  sessionExpiryInterval: 10,
  clientId: 'emqx_c_c',
  properties: {
    userProperties: {
      foo: 'bar'
    },
    topicAliasMaximum: 4096
  }
})

// MQTT 5.0 主题别名使用流程
// 1. 客户端发送 PUBLISH 报文，设置 topicAlias 字段
// 2. 服务端接收到 PUBLISH 报文，将 topicAlias 与 topic 进行映射
// 3. 服务端发送 PUBLISH 报文，设置 topicAlias 字段

client.on('connect', () => {
  console.log('connected')
  client.publish('footest', 'hello', {
    topicAlias: 1
  })
  // client.publish('', 'world', {
  //   topicAlias: 1
  // })

  client.subscribe('footest', {
    topicAlias: 1
  })


})

client.on('message', (topic, message) => {
  console.log(topic, message.toString())
})