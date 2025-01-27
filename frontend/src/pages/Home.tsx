import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/form.css";
import Button from "../components/Button.tsx";
import UrlCard from "../components/UrlCard.tsx";
import InputField from "../components/InputField.tsx";

const Home: React.FC = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleShorten = async () => {
    if (!url) return;
    try {
      const response = await axios.post("http://localhost:3000/UrlShortener", { originalUrl: url });
      setShortUrl(response.data.shortenedUrl);
      setError("");
    } catch (err) {
      setError("Failed to shorten URL");
    }
  };

  return (
    <div className="container">
      <h1>URL Shortener</h1>
      <InputField value={url} onChange={setUrl} placeholder="Enter URL" />
      <Button onClick={handleShorten} text="Shorten" />

      {shortUrl && (
        <>
          <UrlCard shortUrl={shortUrl} />
          <button className="home-btn" onClick={() => setShortUrl("")}>🏠 Home</button>
        </>
      )}

      {error && <p className="error">{error}</p>}

      <button className="get-url-btn" onClick={() => navigate("/get-url")}>
        🔍 Retrieve Shortened URL
      </button>
    </div>
  );
};

export default Home;
