const mqtt = require('mqtt')
const { v4: uuidv4 } = require('uuid')

const c = mqtt.connect('mqtt://localhost:1883', {
  protocolVersion: 5,
  username: 'emqx_u'
})
c.on('connect', () => {
  setInterval(() => {
    c.publish('f/2', 'Hello from OpenTelemetry.js',
      {
        qos: 1,
        properties: {
          // userProperties: {
          //   traceparent: getTraceparent()
          // }
        }
      }, (err, packet) => console.log('Published'))
  }, 1000)
})

function getTraceparent() {
  // return '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01'
  return `00-${uuidv4()}-b7ad6b7169203331-00`
}
c.subscribe('f/2')
c.on('message', (topic, message, packet) => {
  console.log(packet)
})