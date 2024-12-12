const mqtt = require('mqtt');

const options = {
  host: '[::1]', // IPv6地址
  port: 1883, // MQTT代理的端口
  protocol: 'mqtt'
};

const client = mqtt.connect('mqtt://[::1]:1883');

client.on('connect', function () {
  console.log('Connected to MQTT broker');
});

client.on('error', function (err) {
  console.log('Error: ', err);
});

client.on('close', function () {
  console.log('Connection closed');
});

client.on('message', function (topic, message) {
  console.log('Received message:', message.toString());
});

client.subscribe('test');
client.publish('test', '1')
