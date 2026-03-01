import { runDeadlineNotificationJob } from "../services/notificationCron.service.js";

await runDeadlineNotificationJob();
process.exit();