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
      <p className="success-message">
        🎉 <strong>Success!</strong> Here's your short URL:
      </p>
      <div className="url-container">
        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="shortened-url">
          {shortUrl}
        </a>
        <button className="copy-btn" onClick={handleCopy}>
          📋 {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
};

export default UrlCard;
