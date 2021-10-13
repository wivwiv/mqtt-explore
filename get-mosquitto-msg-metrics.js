/**
 * Subscribe +/# and count public mqtt broker `test.mosquitto.org` msg num and payload size
 */
const mqtt = require('mqtt')
const redis = require("redis");
const sqlite = require('sqlite3').verbose()
const path = require('path')
const dateformat = require('dateformat')
const schedule = require('node-schedule');

let prefix = dateformat('yyyymmdd')

const client = redis.createClient({
  host: process.env.REDIS_ADDRESS,
  port: process.env.REDIS_PORT,
  db: process.env.REDIS_DATABASE || 0,
  no_ready_check: true,
});

if (process.env.REDIS_PASSEORD) {
  client.auth(process.env.REDIS_PASSEORD)
}


client.on('error', function(error) {
  console.error(error);
});


const db = new sqlite.Database(
  path.join(__dirname, 'msg-metrics.db')
)
const sql = `
CREATE TABLE topic_metrics(
  id INTEGER PRIMARY KEY autoincrement,
  topic VARCHAR(512),
  number bigint default 0,
  size float,
  created_date data
);
`
db.serialize(() => {
  db.run(sql, (err) => {
    console.log(`create table ${err || 'ok'}`)
  })
})




const c = mqtt.connect('mqtt://test.mosquitto.org:1883')

const MATCH_TOPIC = '#'
c.on('connect', () => {
  console.log('mqtt connected')
  c.subscribe(MATCH_TOPIC)
})

c.on('message', (topic, payload) => {
  client.hincrby(`${prefix}:topic-metrics`, topic, 1, (error, resp) => {
  })
  client.hincrby(`${prefix}:topic-size`, topic, payload.length, (error, resp) => {})
})

function sync_to_db(prefix) {
  client.hgetall(`${prefix}:topic-metrics`, (err, data) => {
    if (err) {
      console.log(`read topic metrics err ${err}`)
      return
    }
    client.hdel(`${prefix}:topic-size`, () => {})

    client.hgetall(`${prefix}:topic-size`, (err, data2) => {
      if (err) {
        console.log(`read topic size err ${err}`)
        return
      }
      client.hdel(`${prefix}:topic-metrics`, () => {})
      const stmt = db.prepare(`INSERT INTO topic_metrics(topic, number, size, created_date) VALUES (?, ?, ?, ?)`);
      Object.entries(data).forEach(([topic, num]) => {
        stmt.run(topic, num, data2[topic], prefix)
      })
      stmt.finalize((err) => {
        if (err) {
          console.log('insert to db error')
          return
        }
        console.log('sync ok')
      });
    })
  })
}

const cron = '2 * * * * ?' || '1 0 0 * * ? *'
let job = schedule.scheduleJob(cron, () => {
  const currentPrefix = prefix
  prefix = dateformat('yyyymmdd')
  console.log(`prefix update: ${prefix}`)
  sync_to_db(currentPrefix)
})