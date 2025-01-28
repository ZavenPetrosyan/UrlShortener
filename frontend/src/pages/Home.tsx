import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/form.css";
import Button from "../components/Button.tsx";
import UrlCard from "../components/UrlCard.tsx";
import InputField from "../components/InputField.tsx";

interface UrlData {
  slug: string;
  originalUrl: string;
  shortenedUrl: string;
}

const Home: React.FC = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [showUrls, setShowUrls] = useState(false);
  const navigate = useNavigate();

  const handleShorten = async () => {
    if (!url) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        "http://localhost:3000/UrlShortener",
        { originalUrl: url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShortUrl(response.data.shortenedUrl);
      setError("");

      setUrls([...urls, response.data]);
    } catch (err) {
      setError("Failed to shorten URL");
    }
  };

  const handleFetchUrls = async () => {
    if (showUrls) {
      setShowUrls(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get("http://localhost:3000/UrlShortener/user/urls", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUrls(response.data);
      setShowUrls(true);
    } catch (err) {
      setError("Failed to fetch URLs. Please try again.");
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

      {/* Button to toggle URLs list */}
      <button className="get-url-btn" onClick={handleFetchUrls}>
        {showUrls ? "📂 Hide Shortened URLs" : "🔍 Retrieve Shortened URLs"}
      </button>

      {/* Display URLs if button is clicked */}
      {showUrls && (
        <div className="url-list">
          <h2>My Shortened URLs</h2>
          {urls.length > 0 ? (
            urls.map((url, index) => (
              <div key={index} className="url-item">
                <strong>Short URL:</strong>{" "}
                <a href={url.shortenedUrl} target="_blank" rel="noopener noreferrer">
                  {url.shortenedUrl}
                </a>
                <br />
                <strong>Original:</strong> {url.originalUrl}
              </div>
            ))
          ) : (
            <p className="no-urls">No URLs found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
