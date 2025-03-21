const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { spawn } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Convert the image buffer to base64
  const imageBase64 = req.file.buffer.toString("base64");

  // Call the Python model script
  const pythonProcess = spawn("python", ["process_image.py", imageBase64]);

  let extractedText = "";

  pythonProcess.stdout.on("data", (data) => {
    extractedText += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    if (code === 0) {
      res.json({ text: extractedText.trim() });
    } else {
      res.status(500).json({ error: "Failed to process image" });
    }
  });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
