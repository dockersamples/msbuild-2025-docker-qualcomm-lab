const { Kafka } = require('kafkajs');
const OpenAI = require('openai');

// Kafka configuration
const kafka = new Kafka({
  clientId: 'ai-marketer',
  brokers: [
    process.env.KAFKA_BROKER_URL || 'localhost:9092'
  ],
});

const consumer = kafka.consumer({ groupId: 'products-group' });

const run = async () => {
  // Connect and subscribe to the products topic
  await consumer.connect();
  await consumer.subscribe({ topic: 'products' });

  console.log('Listening for messages on the "products" topic...');

  // Listen for messages
  await consumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      try {
        await processMessage(data);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    },
  });
};

async function processMessage(data) {
  console.log('Received message:', data);
  
  // Do something with the received message
}

run().catch(console.error);