const mqtt = require('mqtt')
const c = mqtt.connect('mqtt://broker.emqx.io:1883')

c.on('connect', () => {
 c.subscribe('+/#')
 console.log('connected')
})

const topicMap = {}
c.on('message', (topic, payload) => {
 topicMap[topic] = topicMap[topic] || 0
 topicMap[topic] += 1
})

setInterval(() => {
  const list = Object.entries(topicMap)
  list.sort(($1, $2) => $1[1] > $2[1] ? -1 : 1)
  console.log(list.map(($, i) => `${i}  ${$[1]}:  ${$[0]}`).join('\n'))
}, 1000)
