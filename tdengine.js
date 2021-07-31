const mqtt = require('mqtt')



function sleep(time = 100) {
  return new Promise(resolve => setTimeout(resolve, time))
}

let tk = 0

function getClient() {
  const client = mqtt.connect('mqtt://localhost:1883')
  return new Promise((resolve) => {
    client.on('connect', () => {
      resolve(client)
    })
  })
}

const clients = []

async function main() {
  for (let i = 0; i <= 5; i++) {
    clients.push(await getClient())
  }
  for (let i = 0; i <= 10000 * 100; i++) {
    const client = clients[i % 5]
    client.publish('sensor/data', JSON.stringify({
      "temperature": 30, "humidity": 20,
      "volume": 44.5,
      "PM10": 23, "pm25": 61, "SO2": 14, "NO2": 4,
      "CO": 5, "id": "10-c6-1f-1a-1f-47", "area": 1,
      "ts": 1596157444170 + i
    }))
    tk += 1
    await sleep(5000)
  }
}

main()
main()
main()
main()
main()
main()
main()
main()
main()
main()
main()
main()
main()
main()



setInterval(() => {
  console.log('rate ', tk)
  tk = 0
}, 1000)