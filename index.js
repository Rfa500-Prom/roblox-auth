// index.js (para Render)

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const codes = {};

// Utilidad para generar códigos de 6 dígitos
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Ruta para generar código y mostrarlo como HTML estilizado
app.get("/generate", (req, res) => {
  const code = generateCode();
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000; // 12 horas
  codes[code] = { used: false, expiresAt };

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
    </style>
  </head>
  <body>
    <div class="container">
      <div class="title">🔐 Tu código de un solo uso es:</div>
      <div class="code-box">${code}</div>
    </div>
  </body>
  </html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

// Ruta de verificación
app.post("/verify", (req, res) => {
  const { code } = req.body;
  const entry = codes[code];

  if (!entry) {
    return res.json({ success: false, reason: "invalid" });
  }

  if (entry.used) {
    return res.json({ success: false, reason: "used" });
  }

  if (Date.now() > entry.expiresAt) {
    return res.json({ success: false, reason: "expired" });
  }

  entry.used = true;
  return res.json({ success: true });
});

// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
