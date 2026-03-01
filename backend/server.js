import "dotenv/config";
import express from "express";
import cors from "cors";

import { API_PREFIX } from "./config/apiContract.js";
import healthRouter from "./routes/health.routes.js";
import protectedRouter from "./routes/protected.routes.js";
import profileRouter from "./routes/profile.routes.js";
import schemeRouter from "./routes/scheme.routes.js";
import notificationRouter from "./routes/notification.routes.js";
import { startNotificationCron } from "./services/notificationCron.service.js";
import { notFoundHandler, globalErrorHandler } from "./middlewares/error.middleware.js";

// ─── App bootstrap ────────────────────────────────────────────────────────────

const app = express();

// ─── Global middleware ────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use(`${API_PREFIX}/health`, healthRouter);
app.use(`${API_PREFIX}/protected`, protectedRouter);
app.use(`${API_PREFIX}/profile`, profileRouter);
app.use(`${API_PREFIX}/schemes`, schemeRouter);
app.use(`${API_PREFIX}/notifications`, notificationRouter);

// ─── Error handling (must be last) ───────────────────────────────────────────

app.use(notFoundHandler);
app.use(globalErrorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
    console.log(`✅  Server running on http://localhost:${PORT}${API_PREFIX}`);
    startNotificationCron(); // Start daily deadline reminder cron — non-blocking
});

export default app;
