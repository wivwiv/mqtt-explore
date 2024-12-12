const mqtt = require('mqtt');
const readline = require('readline');

const [, , brokerUrl] = process.argv;

if (!brokerUrl) {
  console.error('Usage: node mqtt-latency.js <broker_url>');
  process.exit(1);
}

const client = mqtt.connect(brokerUrl);
const topic = `latency-test-${Date.now()}`;
let connectionLatency = 0;
const latencies = [];

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  connectionLatency = process.hrtime.bigint();
  client.subscribe(topic)

  let messageCount = 0;
  const interval = setInterval(() => {
    const messageId = `message-${Date.now()}-${messageCount}`;
    const timestamp = process.hrtime.bigint();
    const payload = JSON.stringify({ id: messageId, timestamp: timestamp.toString() });
    client.publish(topic, payload);
    console.log(`Published message: ${messageId}`);

    messageCount++;
    if (messageCount === 10) {
      clearInterval(interval);
      client.end();
      printResults(connectionLatency, latencies);
    }
  }, 1000);
});

client.on('message', (receivedTopic, message) => {
  if (receivedTopic === topic) {
    const { id, timestamp } = JSON.parse(message.toString());
    const latency = process.hrtime.bigint() - BigInt(timestamp);
    latencies.push(Number(latency / BigInt(1000000))); // Convert to milliseconds
    console.log(`Received message ${id} with latency ${latencies[latencies.length - 1]}ms`);
  }
});

client.on('error', (err) => {
  console.error('MQTT client error:', err);
  printResults(connectionLatency, latencies);
});

client.on('close', () => {
  printResults(connectionLatency, latencies);
});

function printResults(connectionLatency, latencies) {
  const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;
  const minLatency = latencies.length > 0 ? Math.min(...latencies) : 0;
  const averageLatency = latencies.length > 0 ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length : 0;

  console.log('\nResults:');
  console.log('+-----------------+---------------+');
  console.log('| Metric          | Value (ms)    |');
  console.log('+-----------------+---------------+');
  console.log(`| Maximum Message | ${maxLatency.toFixed(2)} |`);
  console.log(`| Minimum Message | ${minLatency.toFixed(2)} |`);
  console.log(`| Average Message | ${averageLatency.toFixed(2)} |`);
  console.log('+-----------------+---------------+');
}
