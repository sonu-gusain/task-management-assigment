const axios = require("axios");

const WEBHOOK_URL = process.env.ANALYTICS_WEBHOOK_URL;

const sendWebhook = async (task, retries = 3, delay = 1000) => {
  try {
    await axios.post(WEBHOOK_URL, {
      taskId: task._id,
      title: task.title,
      userId: task.userId,
      completedAt: task.completedAt,
    });

    console.log("Webhook sent successfully");
  } catch (error) {
    console.log("Webhook failed, retrying...");

    if (retries > 0) {
      setTimeout(() => {
        sendWebhook(task, retries - 1, delay * 2);
      }, delay);
    } else {
      console.log("Webhook failed after retries");
    }
  }
};

module.exports = {
  sendWebhook,
};
