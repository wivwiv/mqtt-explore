const mqtt= require('mqtt')

const client = mqtt.connect('mqtt://localhost:1883')
client.subscribe(['t/1', 't/2'])
