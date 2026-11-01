// Server web sederhana menggunakan Express (HTTP)
const express = require("express");

const app = express();
const PORT = 3000;

// Middleware untuk membaca data JSON
app.use(express.json());

// Halaman utama
app.get("/", (req, res) => {
  res.send("Halo! Server Express berhasil berjalan.");
});

// Contoh route untuk menampilkan informasi
app.get("/about", (req, res) => {
  res.json({
    aplikasi: "Pengembangan Web",
    server: "Express",
    protokol: "HTTP"
  });
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server HTTP berjalan di http://localhost:${PORT}`);
});
