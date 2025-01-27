# UrlShortener

📚 Overview
The UrlShortener service provides a simple API for generating short URLs from long URLs.
The shortened URLs are stored in MongoDB, while Redis is used for caching and rate limiting.
   🔹 Technologies Used:
   NestJS (Backend Framework)
   MongoDB (Database for storing URL mappings)
   Redis (Cache and Rate Limiting)
   Docker & Docker Compose (Containerized environment)
   Swagger (API Documentation)

#### Endpoints:

1. **POST /UrlShortener (Create Short URL)**
   - 🔍 **Purpose**: Generates a short URL from a long URL and stores it in MongoDB and Redis.

2. **GET /:slug (Redirect to Original URL)**
   - 🔍 **Purpose**: Redirects a short URL to its original URL.

3. **Rate Limiting**
   - ⚙️ **How it works**:
     - Max Requests: 100 requests per 15 minutes per IP.

---

## ⚡️ Installation & Setup

### 🛠 Prerequisites
1. Ensure the following are installed on your system:
   - Docker and Docker Compose
   - Node.js (v18 or higher)
2. Clone the repository:
   ```bash
   git clone git@github.com:ZavenPetrosyan/UrlShortener.git
3. Ensure you have the .env files properly configured for both services:
   - cp .envsample .env

### 🐳 Running the Project with Docker Compose
 1. Navigate to the root directory of the project.
 2. docker-compose up --build
 3. Verify that the containers for mongo, and UrlShortener service are running:
    docker ps
 
    ## 🔍 Verifying Services
    1. UrlShortener
    Swagger API Documentation: http://localhost:3000/api
        **Example Endpoints**:
        /UrlShortener
        /UrlShortener/{slug}

    ## 🧹 Cleanup
    1. To stop all services and remove containers, run: docker-compose down
    2. To remove the containers, volumes, and networks, run: docker-compose down --volumes
