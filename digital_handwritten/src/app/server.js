const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Upload endpoint
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log("File uploaded:", req.file.originalname);
  const imageBase64 = req.file.buffer.toString("base64");

  // Create a temporary file to store the base64 string
  const tempFilePath = path.join(__dirname, "temp_image_base64.txt");
  fs.writeFileSync(tempFilePath, imageBase64);

  // Spawn Python process
  const pythonProcess = spawn("python", ["process_image.py", tempFilePath]);

  let extractedText = "";

  pythonProcess.stdout.on("data", (data) => {
    console.log("Python Output:", data.toString());
    extractedText += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error("Python Error:", data.toString());
  });

  pythonProcess.on("error", (err) => {
    console.error("Failed to start Python script:", err);
    res.status(500).json({ error: "Failed to start Python script" });
  });

  pythonProcess.on("close", (code) => {
    // Delete the temporary file
    fs.unlinkSync(tempFilePath);

    console.log("Python process exited with code:", code);
    console.log("Raw output:", extractedText);

    if (code === 0) {
      try {
        const parsedData = JSON.parse(extractedText.trim());
        res.json(parsedData);
      } catch (error) {
        console.error("JSON Parsing Error:", error);
        res.status(500).json({ error: "Invalid JSON response from Python script" });
      }
    } else {
      res.status(500).json({ error: "Failed to process image" });
    }
  });
});

// Start server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});