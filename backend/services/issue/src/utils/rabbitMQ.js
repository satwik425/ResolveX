const amqp = require("amqplib");

let channel = null;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    // Topic exchange — routes by event name
    await channel.assertExchange("notifications", "topic", { durable: true });

    console.log("RabbitMQ connected");

    connection.on("close", () => {
      console.error("RabbitMQ connection closed, reconnecting...");
      setTimeout(connectRabbitMQ, 5000); // auto reconnect
    });

  } catch (err) {
    console.error("RabbitMQ connection error:", err.message);
    setTimeout(connectRabbitMQ, 5000); // retry
  }
};

const publishEvent = async (routingKey, payload) => {
  try {
    if (!channel) throw new Error("RabbitMQ channel not ready");

    channel.publish(
      "notifications",
      routingKey,                          // e.g. "workspace.member.added"
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }                 // survive RabbitMQ restart
    );

    console.log(`Event published: ${routingKey}`);
  } catch (err) {
    console.error("Failed to publish event:", err.message);
  }
};

const publishActivityLog = (payload) => {
  publishEvent("activity.log", payload).catch((err) =>
    console.error("Activity log publish failed:", err.message)
  );
};

module.exports = { connectRabbitMQ, publishEvent ,publishActivityLog};