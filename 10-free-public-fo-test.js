/**
 * Test free & public online mqtt broker connection
 */
const mqtt = require('mqtt')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')


const sql = `
CREATE TABLE event(
  id INTEGER PRIMARY KEY autoincrement,
  name VARCHAR(50),
  event varchar(50),
  created_at DATETIME default (datetime('now', 'localtime'))
);

CREATE TABLE msg_log(
  id INTEGER PRIMARY KEY autoincrement,
  name VARCHAR(50),
  duration FLOAT DEFAULT 0,
  created_at DATETIME default (datetime('now', 'localtime'))
);
`

const db = new sqlite3.Database(
  path.join(__dirname, './free-public-broker.db')
)
db.serialize(function() {
  db.run(sql, () => {})
})



function createClient(url, name = 'noname', options = { }) {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect(url, {
      keepalive: 60,
      ...options,
    })
    client.on('connect', () => {
      console.log(`${name} connected`)
      client.subscribe('emqx/10-free-publish-broker-for-test', (err) => {
        console.log(`${name} subscribe`)
      })
      setInterval(() => {
        client.publish('emqx/10-free-publish-broker-for-test', JSON.stringify({ start: Date.now() }))
      }, 15 * 1000)
      resolve(client)
    })
    client.on('error', (err) => {
      console.log(`${name} error`)
    })
    client.on('reconnect', (error) => {
      const obj = {
        name,
        event: 'reconnect',
        now: new Date()
      }
      console.log(`${name} reconnect`)
      db.run(`INSERT INTO event(name, event, created_at) VALUES ('${obj.name}', 'reconnect', '${obj.now}')`)
    })
    client.on('message', (topic, payload) => {
      const obj = {
        name,
        now: Date.now(),
        complete: true
      }
      try {
        const data = JSON.parse(payload.toString())
        const duration = Date.now() - data.start
        obj.duration = duration
      } catch (e) {
        obj.duration = -1
        obj.complete = false
      }
      db.run(`INSERT INTO msg_log(name, duration, created_at) VALUES ('${obj.name}', ${obj.duration}, '${obj.now}')`)
    })
  })
}

const list = [
  {
    url: 'mqtt://broker.emqx.io:1883',
    name: 'EMQ X'
  },
  {
    url: 'mqtt://broker.hivemq.com:1883',
    name: 'HiveMQ'
  },
  // {
  //   url: 'wss://mqtt.eclipse.org',
  //   name: 'Eclipse'
  // },
  {
    url: 'mqtt://test.mosquitto.org:1883',
    name: 'Mosquitto'
  },
  // {
  //   url: 'mqtt://mqtt.fluux.io:1883',
  //   name: 'Fluux',
  //   option: {}
  // },
  // {
  //   url: 'mqtt://mqtt.dioty.co:1883',
  //   name: 'Flespi',
  //   option: {}
  // },
  {
    url: 'mqtt://soldier.cloudmqtt.com:18700',
    name: 'CloudMQTT',
    option: {
      username: 'emqx',
      password: 'public'
    }
  }
]

list.forEach((item) => {
  createClient(item.url, item.name, item.option || {})
})