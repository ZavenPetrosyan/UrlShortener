import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/form.css";
import Button from "../components/Button.tsx";
import InputField from "../components/InputField.tsx";

const GetUrl: React.FC = () => {
  const [slug, setSlug] = useState("");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleRetrieve = async () => {
    if (!slug) {
      setError("⚠️ Please enter a valid short URL slug.");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3000/UrlShortener/${slug}`);
      
      if (response.data && response.data.originalUrl) {
        setOriginalUrl(response.data.originalUrl); // ✅ Extract only the string
        setError(null);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      setError("❌ Short URL not found or invalid.");
      setOriginalUrl(null);
    }
  };

  const handleCopy = () => {
    if (originalUrl) {
      navigator.clipboard.writeText(originalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container">
      <h1>Retrieve Shortened URL</h1>
      <InputField value={slug} onChange={setSlug} placeholder="Enter Shortened Slug" />
      <Button onClick={handleRetrieve} text="Retrieve URL" />

      {originalUrl && (
        <div className="url-card">
          <p className="success-message">✅ Success! Here's your short URL:</p>
          <a href={originalUrl} target="_blank" rel="noopener noreferrer">
            {originalUrl}
          </a>
          <button className="copy-btn" onClick={handleCopy}>
            📋 {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}

      {error && <p className="error">{error}</p>}

      <button className="home-btn" onClick={() => navigate("/")}>🏠 Home</button>
    </div>
  );
};

export default GetUrl;
