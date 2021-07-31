const mqtt = require('mqtt')

const URL = 'yst-iot.azure-devices.net'
const PORT = 8883
const CLIENT_ID = 'ttt'
const USERNAME = 'yst-iot.azure-devices.net/ttt/?api-version=2018-06-30'
const PWD = 'SharedAccessSignature sr=yst-iot.azure-devices.net%2Fttt%2F%3Fapi-version%3D2018-06-30&sig=aNMY1KQRPFHx%2BhXBCOV0TTmX5QlA5GZWg9p%2BYj8dibM%3D&se=1600283731&skn='

const client = mqtt.connect(URL, {
  protocol: 'mqtt',
  port: PORT,
  clientId: CLIENT_ID,
  username: USERNAME,
  password: PWD,
  rejectUnauthorized: true,
  connectTimeout: 5 * 1000,
})

client.on('error', (e) => {
  console.error(e)
})
client.on('connected', () => {
  console.log('connected')
})
client.on('reconnect', () => {
  console.log('reconnect')
})
client.on('message', (topic, payload) => {
  console.log(topic, payload)
})