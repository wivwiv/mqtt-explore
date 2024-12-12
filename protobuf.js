const mqtt = require('mqtt')
const protobuf = require('protobufjs')

// Protobuf schema定义，包括消息SensorData

// 使用protobuf.js解析Protobuf schema
protobuf
  .load('./msg.proto', null)
  .then((root) => {
    const SensorData = root.lookupType('SensorData')

    // MQTT连接选项，根据你的MQTT服务器配置进行更改
    const options = {
      clientId: 'your-client-id', // 你的客户端ID
      username: 'your-username', // 你的MQTT用户名
      password: 'your-password', // 你的MQTT密码
    }

    // 连接到MQTT服务器
    const client = mqtt.connect('mqtt://localhost:1883', options)

    client.on('connect', () => {
      console.log('Connected to MQTT broker')

      // 创建Protobuf消息
      const message = SensorData.create({
        id: 'fooo',
        temp: 12.27,
        hum: 33.21,
      })

      // 编码Protobuf消息为二进制
      const binaryMessage = SensorData.encode(message).finish()

      // 将二进制消息发布到"t/1"主题
      client.publish('t/1', binaryMessage, (err) => {
        if (err) {
          console.error('Error publishing Protobuf message:', err)
        } else {
          console.log('Protobuf message published successfully')
        }

        // 断开与MQTT服务器的连接
        client.end()
      })
    })

    client.on('error', (err) => {
      console.error('MQTT connection error:', err)
    })
  })
  .catch((error) => {
    console.error('Error loading Protobuf schema:', error)
  })
