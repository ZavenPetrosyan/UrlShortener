import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/form.css";

interface UrlData {
  slug: string;
  originalUrl: string;
  shortenedUrl: string;
}

const MyUrls: React.FC = () => {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get<UrlData[]>("http://localhost:3000/UrlShortener/user/urls", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUrls(response.data);
      } catch (err) {
        setError("Failed to fetch URLs. Please try again.");
      }
    };

    fetchUrls();
  }, [navigate]);

  return (
    <div className="container">
      <h1>My Shortened URLs</h1>
      {urls.length > 0 ? (
        <ul>
          {urls.map((url, index) => (
            <li key={index}>
              <strong>Short URL:</strong>{" "}
              <a href={url.shortenedUrl} target="_blank" rel="noopener noreferrer">
                {url.shortenedUrl}
              </a>{" "}
              | <strong>Original:</strong> {url.originalUrl}
            </li>
          ))}
        </ul>
      ) : (
        <p>No URLs found.</p>
      )}

      {error && <p className="error">{error}</p>}

      <button className="home-btn" onClick={() => navigate("/")}>🏠 Home</button>
    </div>
  );
};

export default MyUrls;
