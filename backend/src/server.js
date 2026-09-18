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
import googleAuthRoutes from "./routes/googleAuthRoutes.js";
import jacsRoutes from "./routes/jacsRoutes.js";

const app = express();
// Railway asigna automáticamente el puerto a través de process.env.PORT
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Lista de orígenes permitidos
const allowedOrigins = [
  "http://localhost:3000",
  "https://alertaurbanav1.z13.web.core.windows.net", // Dominio de tu frontend en Azure
  process.env.FRONTEND_URL                          // Por si configuras otra variable en Railway
].filter(Boolean); // Filtra valores nulos o no definidos

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Si la petición viene de un origen permitido o es una petición directa (Postman, Swagger, etc.)
  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Rutas de la APII
app.use("/", healthRoutes);
app.use("/api", loginRoutes);
app.use("/api", registerRoutes);
app.use("/api", forgotPasswordRoutes);
app.use("/api", usersRoutes);
app.use("/api", userByIdRoutes);
app.use("/api", huecosRoutes);
app.use("/api", swaggerRoutes);
app.use("/api", googleAuthRoutes);
app.use("/api", jacsRoutes);

// Escuchar en 0.0.0.0 es indispensable para contenedores en la nubee (Railway)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
