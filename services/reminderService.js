const reminderJobs = new Map();

const scheduleReminder = (task) => {
  if (!task.dueDate || task.status === "completed") {
    return;
  }

  const dueTime = new Date(task.dueDate).getTime();
  const reminderTime = dueTime - 60 * 60 * 1000;      
  const delay = reminderTime - Date.now();

  if (delay <= 0) {
    console.log(`Reminder skipped for task "${task.title}" because reminder time already passed`);
    return;
  }

  const timeoutId = setTimeout(() => {
    console.log(
      `Reminder: Task "${task.title}" is due in 1 hour for user ${task.userId}`
    );

    reminderJobs.delete(String(task._id));
  }, delay);

  reminderJobs.set(String(task._id), timeoutId);
};

const cancelReminder = (taskId) => {
  const existingJob = reminderJobs.get(String(taskId));

  if (existingJob) {
    clearTimeout(existingJob);
    reminderJobs.delete(String(taskId));
    console.log(`Reminder cancelled for task ${taskId}`);
  }
};

const rescheduleReminder = (task) => {
  cancelReminder(task._id);
  scheduleReminder(task);
};

module.exports = {
  scheduleReminder,
  cancelReminder,
  rescheduleReminder,
};

