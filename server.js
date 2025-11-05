import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());

// ES module sintaksei nepieciešams __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend failus no public mapes
app.use(express.static(path.join(__dirname, "public")));

// Saglabā augšupielādēto failu atmiņā (nevis diskā)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Proxy POST /upload uz n8n
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const n8nUrl = "https://kaliz.app.n8n.cloud/webhook/f1efd29f-7e6c-42eb-af85-3df77f7f8633";

    const response = await fetch(n8nUrl, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`n8n returned ${response.status}`);
    }

    // Sagaida failu no n8n atbildes
    const arrayBuffer = await response.arrayBuffer();
    res.setHeader("Content-Disposition", `attachment; filename=rezultats.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error(err);
    res.status(500).send("Kļūda apstrādājot failu: " + err.message);
  }
});

// Ja kāds mēģina GET /upload, atbild ar 404 (opcijas)
app.get("/upload", (req, res) => {
  res.status(404).send("Use POST /upload to send a file");
});

// Start serveris uz Render portu
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy darbojas http://localhost:${PORT}`));
