// test EMQX flapping_detect_policy
const mqtt = require('mqtt')

function createClient(opt = {}) {
  return mqtt.connect('mqtt://localhost:1883', {
    ...opt,
    clientId: opt.clientId
  })
}

let client = createClient({
  clientId: 'emqx_ccccc',
  username: 'emqx_u',
  password: 'publix'
})
setInterval(() => {
  if (client.connected) {
    console.log('connected')
    client.end()
  } else {
    client = createClient({
      clientId: 'emqx_ccccc',
      username: 'emqx_u',
      password: 'public'
    })
  }
}, 100)