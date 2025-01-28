import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/form.css";
import Button from "../components/Button.tsx";
import InputField from "../components/InputField.tsx";

interface UrlData {
  _id: string;
  slug: string;
  shortenedUrl: string;
  visits: number;
}

const BASE_URL = "http://localhost:3000";

const Home: React.FC = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [showUrls, setShowUrls] = useState(false);
  const [editSlugId, setEditSlugId] = useState<string | null>(null);
  const [newSlug, setNewSlug] = useState("");
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
        `${BASE_URL}/UrlShortener`,
        { originalUrl: url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShortUrl(response.data.shortenedUrl);
      setError("");
      setUrls([...urls, response.data]); 
    } catch (err) {
      setError("⚠️ Failed to shorten URL. Try again.");
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

      const response = await axios.get(`${BASE_URL}/UrlShortener/user/urls`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUrls(response.data);
      setShowUrls(true);
    } catch (err) {
      setError("⚠️ Failed to fetch URLs. Please try again.");
    }
  };

  const handleRedirect = (slug: string) => {
    window.open(`${BASE_URL}/UrlShortener/redirect/${slug}`, "_blank");
  };

  const handleEditSlug = (id: string, currentSlug: string) => {
    setEditSlugId(id);
    setNewSlug(currentSlug);
  };

  const handleSaveSlug = async () => {
    if (!editSlugId || !newSlug) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.patch(
        `${BASE_URL}/UrlShortener/update-slug`,
        { id: editSlugId, newSlug },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUrls(urls.map(url =>
        url._id === editSlugId ? { ...url, slug: newSlug, shortenedUrl: `${BASE_URL}/${newSlug}` } : url
      ));
      setEditSlugId(null);
    } catch (err) {
      setError("⚠️ Failed to update slug. Try another one.");
    }
  };

  return (
    <div className="container">
      <h1>🚀 URL Shortener</h1>
      <InputField value={url} onChange={setUrl} placeholder="Enter URL" />
      <Button onClick={handleShorten} text="Shorten" />

      {shortUrl && (
        <>
          <button className="home-btn" onClick={() => setShortUrl("")}>🏠 Home</button>
        </>
      )}

      {error && <p className="error">{error}</p>}

      <button className="get-url-btn" onClick={handleFetchUrls}>
        {showUrls ? "📂 Hide Shortened URLs" : "🔍 Retrieve Shortened URLs"}
      </button>

      {showUrls && (
        <div className="url-list">
          <h2>My Shortened URLs</h2>
          {urls.length > 0 ? (
            urls.map((url, index) => (
              <div key={index} className="url-item">
                <strong>Short URL:</strong>{" "}
                {editSlugId === url._id ? (
                  <>
                    <input
                      type="text"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      className="slug-input"
                    />
                    <button onClick={handleSaveSlug} className="save-btn">💾 Save</button>
                  </>
                ) : (
                  <>
                    <button className="link-btn" onClick={() => handleRedirect(url.slug)}>
                      {url.shortenedUrl}
                    </button>{" "}
                    <button onClick={() => handleEditSlug(url._id, url.slug)} className="edit-btn">
                      ✏️ Edit
                    </button>
                  </>
                )}

                {/* 🏆 Improved Visit Display */}
                <div className="visits-container">
                  <span className="visits-icon">📊</span>
                  <span className="visits-text">{url.visits} visits</span>
                </div>
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
