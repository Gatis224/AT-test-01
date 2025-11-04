import express from "express";
import cors from "cors";
import multer from "multer";
import fetch from "node-fetch";
import fs from "fs";
import FormData from "form-data";

const app = express();
app.use(cors());

// Saglabā augšupielādēto failu atmiņā (nevis diskā)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("file", req.file.buffer, req.file.originalname);

    const n8nUrl = "https://gatiss.app.n8n.cloud/webhook-test/f1efd29f-7e6c-42eb-af85-3df77f7f8633";

    const response = await fetch(n8nUrl, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`n8n returned ${response.status}`);
    }

    // Sagaidām failu no n8n atbildes
    const arrayBuffer = await response.arrayBuffer();
    res.setHeader("Content-Disposition", "attachment; filename=rezultats.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    console.error(err);
    res.status(500).send("Kļūda apstrādājot failu: " + err.message);
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Proxy darbojas http://localhost:${PORT}`));
