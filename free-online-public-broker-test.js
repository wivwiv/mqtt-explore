/**
 * Test free & public online mqtt broker connection
 */
const mqtt = require('mqtt')
const path = require('path')
const mysql = require('mysql2');
const { exec } = require('child_process');

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '123456',
  database: 'msg_log'
})



function createClient(url, name = 'noname', options = { }) {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect(url, {
      keepalive: 60,
      connectTimeout: 15 * 1000,
      ...options,
    })
    client.on('connect', () => {
      console.log(`${name} connected`)
      client.subscribe('emqx/10-free-publish-broker-for-test', (err) => {
        console.log(`${name} subscribe`)
      })
      setInterval(() => {
        client.publish('emqx/10-free-publish-broker-for-test', JSON.stringify({ start: Date.now() }))
      }, 5 * 1000)
      resolve(client)
    })
    client.on('error', (err) => {
      console.log(`${name} error`)
      console.error(err)
    })
    client.on('reconnect', (error) => {
      const obj = {
        name,
        event: 'reconnect',
        now: new Date()
      }
      console.log(`${name} reconnect`)
      // db.run(`INSERT INTO event(name, event, created_at) VALUES ('${obj.name}', 'reconnect', '${obj.now}')`)
    })
    client.on('message', (topic, payload) => {
      const obj = {
        name,
        now: Math.floor(Date.now() / 1000),
        complete: true
      }
      try {
        const data = JSON.parse(payload.toString())
        const duration = Date.now() - data.start
        obj.duration = duration
        connection.execute(
          `INSERT INTO msg_log(name, duration, created_at) VALUES ('${obj.name}', ${obj.duration}, FROM_UNIXTIME(${obj.now}))`,
          (err, result) => {
            if (!err) {
              console.log(obj.name, 'save success')
            } else {
              console.log(obj.name, 'save error', err)
            }
          }
        )
      } catch (e) {
        obj.duration = -1
        obj.complete = false
      }
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
  {
    url: 'mqtt://mqtt.eclipseprojects.io:1883',
    name: 'Eclipse'
  },
  {
    url: 'mqtt://test.mosquitto.org:1883',
    name: 'Mosquitto'
  },
  {
    url: 'mqtt://broker-cn.emqx.io:1883',
    name: 'EMQ X CN'
  },
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