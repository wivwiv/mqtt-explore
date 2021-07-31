const mqtt = require('mqtt')

const now = Date.now()

function getTime() {
  return Math.floor((Date.now() - now) / 1000).toString().padStart(3, '0') + 's'
}

function createClient(url, username = '', keepalive = 60) {
  username = `${username}_${keepalive}`
  return new Promise(resolve => {
    const client = mqtt.connect(url, {
      keepalive,
      username,
    })
    username = username.padEnd(5, ' ')
    client.on('connect', () => {
      console.log(`${username} ${getTime()} connected`)
      client.subscribe(`t/1/1/1/1/1/1/1/${keepalive}`)
      setTimeout(() => {
        console.log(`${username} ${getTime()} try to send msg connected`)
        client.publish(`t/1/1/1/1/1/1/1/${keepalive}`, getTime(), (error, packet) => {
          if (error) {
            console.error(`${username} ${getTime()} send msg error`)
          } else {
            console.log(`${username} send ok`)
          }
        })
        setTimeout(() => {
          client.end()
        }, 10 * 1000)
      }, (keepalive + 10) * 1000);
    })
    client.on('message', (topic, payload) => {
      console.log(`${username} ${getTime()} get msg ${payload.toString()}`)
    })
    client.on('packetsend', (packet) => {
      console.log(`${username} ${getTime()} packetsend: ${packet.cmd}`)
    })
    client.on('reconnect', () => {
      console.log(`${username} ${getTime()} reconnect`)
    })
    client.on('packetreceive', (packet) => {
      console.log(`${username} ${getTime()} packetreceive: ${packet.cmd}`)
    })
  })
}


// AWS 线路
createClient('mqtt://broker.emqx.io:1883', 'aws', 150)
createClient('mqtt://broker.emqx.io:1883', 'aws', 300)
createClient('mqtt://broker.emqx.io:1883', 'aws', 400)
createClient('mqtt://broker.emqx.io:1883', 'aws', 500)
createClient('mqtt://broker.emqx.io:1883', 'aws', 600)
createClient('mqtt://broker.emqx.io:1883', 'aws', 900)
createClient('mqtt://broker.emqx.io:1883', 'aws', 1800)

// 国内线路
createClient('mqtt://120.24.66.26:1883', 'cn', 150)
createClient('mqtt://120.24.66.26:1883', 'cn', 300)
createClient('mqtt://120.24.66.26:1883', 'cn', 600)
createClient('mqtt://120.24.66.26:1883', 'cn', 900)
createClient('mqtt://120.24.66.26:1883', 'cn', 1800)


const c1 = mqtt.connect('mqtt://broker.emqx.io:1883')
const c2 = mqtt.connect('mqtt://120.24.66.26:1883')

c1.subscribe('t/1/1/1/1/1/1/1/+')
c2.subscribe('t/1/1/1/1/1/1/1/+')

c1.on('message', onMessage)
c2.on('message', onMessage)

function onMessage(topic, payload) {
  console.log(`recv ${payload.toString()} ${getTime()}`)
}

