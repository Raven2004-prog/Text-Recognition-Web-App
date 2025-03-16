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

  useEffect(() => {
    const speed = isDeleting ? 50 : 100; // Typing vs Deleting speed

    if (!isDeleting && index === fullText.length) {
      setTimeout(() => setIsDeleting(true), 1000); // Pause before deleting
    }

    if (isDeleting && index === 0) {
      setTimeout(() => setIsDeleting(false), 500); // Pause before retyping
    }

    const timeout = setTimeout(() => {
      setDisplayedText(fullText.substring(0, isDeleting ? index - 1 : index + 1));
      setIndex((prev) => (isDeleting ? prev - 1 : prev + 1));
    }, speed);

    return () => clearTimeout(timeout);
  }, [index, isDeleting]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
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

      {/* Image Preview */}
      {image && (
        <div className="mt-6">
          <p className="text-gray-600 mb-2 text-center font-serif text-lg">Preview:</p>
          <img src={image} alt="Uploaded" className="w-72 h-48 object-cover rounded-xl shadow-lg border-2 border-black" />
        </div>
      )}

      {/* Process Button */}
      {image && (
        <button className="mt-6 bg-black text-white px-6 py-3 flex items-center gap-2 rounded-full hover:bg-gray-800 transition shadow-lg">
          <FileText size={20} />
          <span>Process Text</span>
          <ArrowRight size={20} />
        </button>
      )}
    </div>
  );
}
