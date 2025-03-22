"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, ArrowRight } from "lucide-react";

export default function Home() {
  const fullText = "Convert Handwritten Notes into Digital Text";
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Typewriter effect
  useEffect(() => {
    const speed = isDeleting ? 50 : 100;

    if (!isDeleting && index === fullText.length) {
      setTimeout(() => setIsDeleting(true), 1000);
    }

    if (isDeleting && index === 0) {
      setTimeout(() => setIsDeleting(false), 500);
    }

    const timeout = setTimeout(() => {
      setDisplayedText(fullText.substring(0, isDeleting ? index - 1 : index + 1));
      setIndex((prev) => (isDeleting ? prev - 1 : prev + 1));
    }, speed);

    return () => clearTimeout(timeout);
  }, [index, isDeleting]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type.startsWith("image/")) {
      setImage(URL.createObjectURL(uploadedFile));
      setFile(uploadedFile);
      setExtractedText("");
      setError("");
    } else {
      setError("Please upload a valid image file.");
    }
  };

  // Process text extraction
  const handleProcessText = async () => {
    if (!file) {
      setError("Please upload an image first.");
      return;
    }

    setIsProcessing(true);
    setError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      console.log("Uploading image...");
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process image.");
      }

      const data = await response.json();
      console.log("Response data:", data);
      setExtractedText(data.text || "No text extracted");
    } catch (error) {
      console.error("Error processing text:", error);
      setError("Error processing image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black px-6">
      {/* Typewriter Effect */}
      <motion.h1
        className="text-5xl md:text-7xl font-serif font-bold text-center text-black drop-shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        {displayedText}
        <span className="animate-blink">|</span>
      </motion.h1>

      <p className="text-gray-600 mt-4 text-center max-w-xl font-serif text-lg">
        Upload your handwritten text image and let our AI-powered tool convert it into digital text effortlessly.
      </p>

      {/* Upload Section */}
      <div className="mt-8 flex flex-col items-center">
        <label className="cursor-pointer flex items-center gap-3 bg-black px-6 py-3 rounded-full hover:bg-gray-800 transition shadow-lg">
          <Upload size={20} className="text-white" />
          <span className="font-medium text-white">Upload Image</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
        </label>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {/* Image Preview */}
      {image && (
        <div className="mt-6">
          <p className="text-gray-600 mb-2 text-center font-serif text-lg">Preview:</p>
          <img src={image} alt="Uploaded" className="w-72 h-48 object-cover rounded-xl shadow-lg border-2 border-black" />
        </div>
      )}

      {/* Process Button */}
      {image && (
        <button
          onClick={handleProcessText}
          disabled={isProcessing}
          className="mt-6 bg-black text-white px-6 py-3 flex items-center gap-2 rounded-full hover:bg-gray-800 transition shadow-lg disabled:opacity-50"
        >
          <FileText size={20} />
          <span>{isProcessing ? "Processing..." : "Process Text"}</span>
          <ArrowRight size={20} />
        </button>
      )}

      {/* Extracted Text Display */}
      {extractedText && (
        <div className="mt-6 bg-gray-100 p-4 rounded-lg shadow-md max-w-xl text-center">
          <h2 className="font-bold text-lg text-black">Extracted Text:</h2>
          <p className="text-gray-800 font-serif mt-2">{extractedText}</p>
        </div>
      )}
    </div>
  );
}