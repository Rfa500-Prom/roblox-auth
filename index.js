const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const codes = {};

// Función para generar un código aleatorio de 6 caracteres
function generateCode() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Ruta para generar un nuevo código
app.get("/generate", (req, res) => {
  const code = generateCode();
  const timestamp = Date.now();
  codes[code] = { used: false, timestamp };
  res.json({ code });
});

// Ruta para verificar el código
app.post("/verify", (req, res) => {
  const { code } = req.body;

  if (!code || !codes[code]) {
    return res.json({ success: false, reason: "invalid" });
  }

  const codeData = codes[code];
  const now = Date.now();

  // Verificar expiración (12 horas)
  const twelveHours = 12 * 60 * 60 * 1000;
  if (now - codeData.timestamp > twelveHours) {
    delete codes[code];
    return res.json({ success: false, reason: "expired" });
  }

  if (codeData.used) {
    return res.json({ success: false, reason: "used" });
  }

  codeData.used = true;
  res.json({ success: true });
});

// Ruta raíz
app.get("/", (req, res) => {
  res.send("Servidor activo");
});

// Ruta para mantener activo con UptimeRobot
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});