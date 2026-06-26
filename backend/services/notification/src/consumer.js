const amqp = require("amqplib");
const { sendEmail } = require("./emailService");
const { userClient } = require("./utils/userClient");
const activityLogModel = require("./models/activityLogModel");

const ROUTING_KEYS = [
  "workspace.member.added",
  "issue.assigned",
  "sprint.status.changed",
  "activity.log" 
];

const connectAndConsume = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL );
    const channel = await connection.createChannel();

    await channel.assertExchange("notifications", "topic", { durable: true });

    // Dedicated queue for notification service
    const { queue } = await channel.assertQueue("notification_service", { durable: true });

    // Bind all relevant routing keys
    for (const key of ROUTING_KEYS) {
      await channel.bindQueue(queue, "notifications", key);
    }

    channel.prefetch(1); // process one message at a time

    console.log("Notification service listening for events...");

    channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());
        console.log("Received event:", payload.type);

        const routingKey = msg.fields.routingKey;
        if(routingKey==="activity.log"){
        await handleActivityLog(payload);
        }else{
        await handleNotification(payload);
        }
        channel.ack(msg); // ✅ acknowledge after processing
      } catch (err) {
        console.error("Error processing message:", err.message);
        channel.nack(msg, false, false); // ❌ reject, don't requeue bad messages
      }
    });

    connection.on("close", () => {
      console.error("RabbitMQ closed, reconnecting...");
      setTimeout(connectAndConsume, 5000);
    });

  } catch (err) {
    console.error("RabbitMQ error:", err.message);
    setTimeout(connectAndConsume, 5000);
  }
};

const handleActivityLog = async (payload) => {
  await activityLogModel.create(payload);
  console.log("Activity logged:", payload.action);
};

const handleNotification = async (payload) => {
  switch (payload.type) {

    case "MEMBER_ADDED": {
      const user = await userClient.getUserById(payload.addedUserId);
      await sendEmail({
        to: user.email,
        subject: `You were added to workspace: ${payload.workspaceName}`,
        html: `<p>Hi ${user.name},</p>
               <p>You have been added to the workspace <strong>${payload.workspaceName}</strong>.</p>`
      });
      break;
    }

    case "ISSUE_ASSIGNED": {
      const user = await userClient.getUserById(payload.assignedToUserId);
      await sendEmail({
        to: user.email,
        subject: `New issue assigned to you: ${payload.issueTitle}`,
        html: `<p>Hi ${user.name},</p>
               <p>You have been assigned the issue <strong>${payload.issueTitle}</strong> 
               in project <strong>${payload.projectName}</strong>.</p>`
      });
      break;
    }

    case "SPRINT_STARTED":
    case "SPRINT_COMPLETED": {
      const users = await Promise.all(payload.memberIds.map(id => userClient.getUserById(id)));
      const action = payload.type === "SPRINT_STARTED" ? "started" : "completed";

      await Promise.all(users.map(user =>
        sendEmail({
          to: user.email,
          subject: `Sprint ${action}: ${payload.sprintName}`,
          html: `<p>Hi ${user.name},</p>
                 <p>Sprint <strong>${payload.sprintName}</strong> has been ${action}.</p>`
        })
      ));
      break;
    }

    default:
      console.warn("Unknown event type:", payload.type);
  }
};

module.exports = { connectAndConsume };