const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const codes = {};

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function isExpired(timestamp) {
  const now = Date.now();
  const twelveHours = 12 * 60 * 60 * 1000;
  return now - timestamp > twelveHours;
}

// Ruta para generar código
app.get("/generate", (req, res) => {
  const code = generateCode();
  const timestamp = Date.now();

  codes[code] = {
    used: false,
    createdAt: timestamp
  };

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Código de acceso</title>
    <style>
      body {
        background-color: #0f172a;
        color: white;
        font-family: Arial, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
      }
      .container {
        background-color: #1e293b;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        text-align: center;
      }
      .title {
        font-size: 24px;
        margin-bottom: 20px;
        color: #93c5fd;
      }
      .code-box {
        font-size: 36px;
        padding: 15px 30px;
        background-color: white;
        color: #0f172a;
        border-radius: 10px;
        border: 2px solid #3b82f6;
        display: inline-block;
        font-weight: bold;
        letter-spacing: 4px;
      }
      .note {
        margin-top: 15px;
        font-size: 14px;
        color: #cbd5e1;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="title">🔐 Tu código de un solo uso es:</div>
      <div class="code-box">${code}</div>
      <div class="note">Este código es válido por 12 horas.</div>
    </div>
  </body>
  </html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

// Ruta para verificar código
app.post("/verify", (req, res) => {
  const { code } = req.body;

  if (!code || !codes[code]) {
    return res.json({ success: false, reason: "invalid" });
  }

  if (codes[code].used) {
    return res.json({ success: false, reason: "used" });
  }

  if (isExpired(codes[code].createdAt)) {
    return res.json({ success: false, reason: "expired" });
  }

  codes[code].used = true;
  return res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
