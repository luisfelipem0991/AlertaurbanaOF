import dotenv from "dotenv";
dotenv.config();

import express from "express";
import healthRoutes from "./routes/healthRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import registerRoutes from "./routes/registerRoutes.js";
import forgotPasswordRoutes from "./routes/forgotPasswordRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import userByIdRoutes from "./routes/userByIdRoutes.js";
import huecosRoutes from "./routes/huecosRoutes.js";
import swaggerRoutes from "./routes/swaggerRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === allowedOrigin) {
    res.header("Access-Control-Allow-Origin", allowedOrigin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use("/", healthRoutes);
app.use("/api", loginRoutes);
app.use("/api", registerRoutes);
app.use("/api", forgotPasswordRoutes);
app.use("/api", usersRoutes);
app.use("/api", userByIdRoutes);
app.use("/api", huecosRoutes);
app.use("/api", swaggerRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
