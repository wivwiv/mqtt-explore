const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://127.0.0.1:1883')

const topics = `wivwiv/bedroom/temperature
wivwiv/bedroom/humidity
wivwiv/bedroom/airquality
wivwiv/livingroom/temperature
wivwiv/livingroom/humidity
wivwiv/livingroom/airquality
wivwiv/kitchen/temperature
wivwiv/kitchen/humidity
wivwiv/kitchen/airquality`.split('\n')

client.on('connect', () => {
  console.log('connected')
  setInterval(() => {
    topics.forEach((topic) => {
      sendRandom(topic)
      console.log('send')
    })
  }, 3000)
})

function sendRandom(topic = '') {
  const [user, room, metric] = topic.split('/')
  const val = parseFloat(
    (Math.random() * 20).toFixed(2)
  )
  client.publish(topic, JSON.stringify({
    room,
    metric,
    val,
    user,
    ts: Date.now()
  }))
}