const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

let codes = {}; // almacén de códigos

function generateCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

app.get("/", (req, res) => {
  res.send("Visita /generate para obtener un código único.");
});

// ✅ Generar código HTML estilizado
app.get("/generate", (req, res) => {
  const code = generateCode();
  codes[code] = {
    used: false,
    createdAt: Date.now()
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
        margin-bottom: 20px;
      }
      .note {
        color: #94a3b8;
        font-size: 14px;
        margin-top: 10px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="title">🔐 Tu código de un solo uso es:</div>
      <div class="code-box">${code}</div>
      <div class="note">Este código es válido por 12 horas</div>
    </div>
  </body>
  </html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.send(html);
});

// ✅ Verificar código desde Roblox
app.post("/verify", (req, res) => {
  const code = req.body.code?.toUpperCase();
  const now = Date.now();

  if (codes[code]) {
    const { used, createdAt } = codes[code];
    const age = now - createdAt;

    if (used) {
      return res.json({ success: false, reason: "used" });
    }

    if (age > 12 * 60 * 60 * 1000) { // 12 horas
      return res.json({ success: false, reason: "expired" });
    }

    codes[code].used = true;
    return res.json({ success: true });
  }

  res.json({ success: false, reason: "invalid" });
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
