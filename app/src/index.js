const { Kafka } = require('kafkajs');
const OpenAI = require('openai');

const openai = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || "http://localhost:12434/engines/v1",
  apiKey: "not-required",
});

const SYSTEM_PROMPT = `You are a tool that is used to generate marketing emails to potential customers for a newly created product. You will be given the name and description of the product, and you will generate a marketing email to potential customers.
        
The result should be a JSON object with the following structure:
{
  "subject": "Subject line for email",
  "body": "Body of email"
}

Do NOT include any additional information or explanations. Only the JSON object should be returned.

The email MUST be less than 200 words in length. 
The email MUST be in English and should be written in a friendly and engaging tone. 
The email should include a call to action, such as "Click here to learn more" or "Order now". 
The email should also include a subject line that is catchy and relevant to the product.
The email should be relevant to the product and should not contain any irrelevant information. 
The email should be written in a way that is easy to understand and should not contain any technical jargon. 
The email should be written in a way that is engaging and should not be boring. 
The email should be written in a way that is persuasive and should not be pushy. 
The email should be written in a way that is friendly and should not be rude. 
The email should be written in a way that is professional and should not be unprofessional.
`;

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

  console.log('Generating email now');

  // Generate sample marketing emails
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'jacobhoward459/phi4-mini-instruct:3.84B-Q4_0',
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `Product name: ${data.name}.\nProduct description: ${data.description}\n`,
      },
    ],
  });

  // Sometimes, models still wrap JSON in markdown code blocks, so let's remove that.
  let responseText = response.choices[0].message.content;
  if (responseText.startsWith('```json')) {
    responseText = responseText.slice(7, -3);
  }

  // Simply output them to the console.
  // In real situations, we'd look up relavent customers and queue emails.
  const { subject, body } = JSON.parse(responseText);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${body}`);
}

// run().catch(console.error);
processMessage({
  "action": "product_created",
  "id": "product-51cb2813",
  "name": "LucidFlow",
  "description": "A bedside device utilizing subtle, dynamically shifting ambient light and binaural audio to gently guide you into deeper, more restorative sleep. Connects to your Microsoft 365 calendar to proactively adjust lighting and soundscapes based on your upcoming schedule, minimizing stress and promoting optimal rest."
});

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    console.log(`Received ${signal}. Disconnecting...`);
    consumer.disconnect();
    process.exit(0);
  });
});