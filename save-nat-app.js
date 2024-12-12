const { spawn } = require('child_process');
const mqtt = require('mqtt');

const natapp = spawn('/opt/natapp-starter/natapp', ['--authtoken', '80b8070ec0a1ac01']);

const client = mqtt.connect('mqtt://broker.emqx.io:1883');

client.on('connect', () => {

  natapp.stdout.on('data', (data) => {
    client.publish('mynatapp/home', JSON.stringify({
      msg: data.toString(), 
      updatedAt: new Date().toISOString()
    }));
  });

  natapp.stderr.on('data', (data) => {
    client.publish('mynatapp/error', JSON.stringify({
      error: data.toString(),
      updatedAt: new Date().toISOString() 
    }));
  });

});