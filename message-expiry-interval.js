const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://broker.hivemq.com:1883', {
  protocolVersion: 5
})
client.on('message', (topic, payload) => {
  const data = JSON.parse(payload.toString())
  const msgPublishTime = data.ts
  console.log(`Recv msg from ${topic}`)
  console.log(`Msg lifetime: ${(Date.now() - msgPublishTime) / 1000}`)
})

console.log(`TEST MQTT 5.0 MessageExpiryInterval`)
client.on('connect', () => {
  console.log('Connected')
  // Clear current
  client.publish('t/1/message-expiry-interval-test', '')
  client.publish('t/1/message-expiry-interval-test',
    JSON.stringify({
      ts: Date.now()
    }),
    {
      retain: true,
      properties: {
        // https://www.npmjs.com/package/mqtt#:~:text=or%20not%20boolean%2C-,messageExpiryInterval,-%3A%20the%20lifetime%20of
        messageExpiryInterval: 10
      }
    }, 
    (err) => {
      if (!err) {
        console.log('Published, ttl is 10, subscription in 11 seconds, waiting...')
        setTimeout(() => {
          console.log('Subscription before expiry. Did you get the message?\nNo: ❌\nYes: ✅')
          client.subscribe('t/1/message-expiry-interval-test')
          client.unsubscribe('t/1/message-expiry-interval-test')
        }, 5 * 1000)
        setTimeout(() => {
          console.log('Subscribe after expiry. Did you get the message?\nNo: ✅\nYes: ❌')
          client.subscribe('t/1/message-expiry-interval-test')
        }, 11 * 1000)
      }
    }
  )
})