import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import path from "path";

const app = express();
app.use(cors());

// Saglabā failus atmiņā
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Pirmais n8n workflow
const n8nUrl1 = "https://kaliz.app.n8n.cloud/webhook/f1efd29f-7e6c-42eb-af85-3df77f7f8633";
// Otrais n8n workflow
const n8nUrl2 = "https://augstakatiesa.app.n8n.cloud/webhook-test/b02edf7f-3fe9-49fa-ae2e-0eaba980fa21";

// Kopīga funkcija faila sūtīšanai
async function sendToN8N(req, res, n8nUrl) {
  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const response = await fetch(n8nUrl, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`n8n returned ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    res.setHeader("Content-Disposition", "attachment; filename=rezultats.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error(err);
    res.status(500).send("Kļūda apstrādājot failu: " + err.message);
  }
}

app.post("/upload1", upload.single("file"), (req, res) => sendToN8N(req, res, n8nUrl1));
app.post("/upload2", upload.single("file"), (req, res) => sendToN8N(req, res, n8nUrl2));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Proxy darbojas http://localhost:${PORT}`));
