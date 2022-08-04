const mqtt = require('mqtt')

const client = mqtt.connect('mqtt://localhost:1883', {
  properties: {
    topicAliasMaximum: 20, // representing the Topic Alias Maximum value indicates the highest value that the Client will accept as a Topic Alias sent by the Server number
  }
})

// on client connected
console.log('connected')

client.subscribe('emqx/#', (err, granted) => {
  if (err) {
    throw new Error('Sub Error')
  }
  if (granted && granted[0].qos === 128) {
    throw new Error('Sub Error')
  }
  console.log('Sub success')


  client.publish('emqx/test', 'first pub msg', {
    properties: {
      topicAlias: 1,
    }
  })

  client.publish('1', 'pub with alias', {
    properties: {
      topicAlias: 1,
    }
  }, console.error)

})



client.on('message', (topic, payload) => {
  console.log(`Received msg from ${topic}: ${payload}`)
})