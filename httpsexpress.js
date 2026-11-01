// Server web Express menggunakan HTTPS
// Sebelum menjalankan file ini, buat sertifikat SSL lokal:
//   openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365
//
// Simpan key.pem dan cert.pem di folder yang sama dengan file ini.

const express = require("express");
const https = require("https");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3443;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Halo! Server Express melalui HTTPS berhasil berjalan.");
});

app.get("/about", (req, res) => {
  res.json({
    aplikasi: "Pengembangan Web",
    server: "Express",
    protokol: "HTTPS"
  });
});

const keyPath = path.join(__dirname, "key.pem");
const certPath = path.join(__dirname, "cert.pem");

if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
  console.error("Sertifikat HTTPS belum ditemukan.");
  console.error("Buat key.pem dan cert.pem dengan perintah OpenSSL di komentar bagian atas.");
  process.exit(1);
}

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server HTTPS berjalan di https://localhost:${PORT}`);
});
