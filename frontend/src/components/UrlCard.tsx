import React, { useState } from "react";

interface UrlCardProps {
  shortUrl: string;
}

const UrlCard: React.FC<UrlCardProps> = ({ shortUrl }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="url-card">
      <p className="success-message"><i>Success! Here's your short URL:</i></p>
      <div className="url-container">
        <a href={shortUrl} target="_blank" rel="noopener noreferrer">
          {shortUrl}
        </a>
        <button className="copy-btn" onClick={handleCopy}>
          📋 Copy
        </button>
      </div>
      {copied && <p className="copied-text">Copied to clipboard!</p>}
    </div>
  );
};

export default UrlCard;
