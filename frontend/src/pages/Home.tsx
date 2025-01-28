import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/form.css";
import Button from "../components/Button.tsx";
import InputField from "../components/InputField.tsx";
import UrlCard from "../components/UrlCard.tsx";

interface UrlData {
  _id: string;
  slug: string;
  shortenedUrl: string;
  visits: number;
}

const BASE_URL = "http://localhost:3000";

const Home: React.FC = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [showUrls, setShowUrls] = useState(false);
  const [editSlugId, setEditSlugId] = useState<string | null>(null);
  const [newSlug, setNewSlug] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if (!token || !tokenExpiry || Date.now() > Number(tokenExpiry)) {
      console.log("🔴 Token expired. Redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      navigate("/login");
    }
  }, [navigate]);

  const handleShorten = async () => {
    if (!url.trim()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/urlShortener`,
        { originalUrl: url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setError("");
      setShortUrl(response.data.shortenedUrl);
      setUrls((prevUrls) => [...prevUrls, response.data]);
    } catch (err: any) {
      setError(
        err.response && err.response.status === 409
          ? "⚠️ This URL has already been shortened."
          : "⚠️ Failed to shorten URL. Try again."
      );
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

      const response = await axios.get(`${BASE_URL}/urlShortener/user/urls`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUrls(response.data);
      setShowUrls(true);
    } catch {
      setError("⚠️ Failed to fetch URLs. Please try again.");
    }
  };

  const handleRedirect = (slug: string) => {
    window.open(`${BASE_URL}/urlShortener/redirect/${slug}`, "_blank");
  };

  const handleEditSlug = (id: string, currentSlug: string) => {
    setEditSlugId(id);
    setNewSlug(currentSlug);
  };

  const handleSaveSlug = async () => {
    if (!editSlugId || !newSlug.trim()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      await axios.patch(
        `${BASE_URL}/urlShortener/update-slug`,
        { id: editSlugId, newSlug },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUrls((prevUrls) =>
        prevUrls.map((url) =>
          url._id === editSlugId
            ? { ...url, slug: newSlug, shortenedUrl: `${BASE_URL}/${newSlug}` }
            : url
        )
      );

      setEditSlugId(null);
    } catch {
      setError("⚠️ Failed to update slug. Try another one.");
    }
  };

  const handleCancelEdit = () => {
    setEditSlugId(null);
    setNewSlug("");
  };

  const handleReset = () => {
    setShortUrl(null);
    setUrl("");
  };

  return (
    <div className="container">
      <h1>🚀 URL Shortener</h1>

      {shortUrl ? (
        <>
          <UrlCard shortUrl={shortUrl} />
          <button className="home-btn" onClick={handleReset}>
            🏠 Home
          </button>
        </>
      ) : (
        <>
          <InputField value={url} onChange={setUrl} placeholder="Enter URL" />
          <Button onClick={handleShorten} text="Shorten URL" />
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
            urls.map((url) => (
              <div key={url._id} className="url-item">
                <strong>Short URL:</strong>{" "}
                {editSlugId === url._id ? (
                  <>
                    <input
                      type="text"
                      value={newSlug}
                      onChange={(e) => setNewSlug(e.target.value)}
                      className="slug-input"
                    />
                    <button onClick={handleSaveSlug} className="save-btn">
                      💾 Save
                    </button>
                    <button onClick={handleCancelEdit} className="cancel-btn">
                      ❌ Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="link-btn"
                      onClick={() => handleRedirect(url.slug)}
                    >
                      {url.shortenedUrl}
                    </button>{" "}
                    <button
                      onClick={() => handleEditSlug(url._id, url.slug)}
                      className="edit-btn"
                    >
                      ✏️ Edit
                    </button>
                  </>
                )}

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
