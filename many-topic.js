const mqtt = require('mqtt')

let topics = []

for (let i =0; i<=10; i++) {
  const c = mqtt.connect('mqtt://127.0.0.1:1883', { username: 'emqx', password: 'public' })
  for (let j = 0; j<=100;j++) {
    c.subscribe(`t/${i}/${j}`)
    topics.push(`t/${i}/${j}`)
  }
}
