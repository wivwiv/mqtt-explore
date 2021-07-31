/**
 * Subscribe +/# and count public mqtt broker `test.mosquitto.org` msg num and payload size
 */
const mqtt = require('mqtt')
const redis = require("redis");
const client = redis.createClient({
  host: process.env.REDIS_ADDRESS,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSEORD || null
});

client.on('error', function(error) {
  console.error(error);
});

const MATCH_TOPIC = '+/#'

const c = mqtt.connect('mqtt://test.mosquitto.org:1883')

c.on('connect', () => {
  // c.subscribe(MATCH_TOPIC)
})

client.hgetall('topic-metrics', (error, resp) => {
  console.log(resp)
})


c.on('message', (topic, payload) => {
  client.hincrby('topic-metrics', topic, 1, (error, resp) => {
  })
  client.hincrby('topic-size', topic, payload.length, (error, resp) => {})

  if (topic === 'wivwiv/req-topic-metrics') {
    client.hgetall('topic-metrics', (err, data) => {
      c.publish('wivwiv/resp-topic-metrics', JSON.stringify(data))
    })
  }
  if (topic === 'wivwiv/req-topic-size') {
    client.hgetall('topic-size', (err, data) => {
      c.publish('wivwiv/resp-topic-size', JSON.stringify(data))
    })
  }
})
