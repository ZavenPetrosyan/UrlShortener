# UrlShortener

📚 **Overview**  
The UrlShortener service provides a simple API for generating short URLs from long URLs.  
The shortened URLs are stored in MongoDB, while Redis is used for caching and rate limiting.  

### 🔹 Technologies Used:
- **Backend**: NestJS (Backend Framework), MongoDB (Database for storing URL mappings), Redis (Cache and Rate Limiting)
- **Frontend**: React (with TypeScript), Axios
- **DevOps**: Docker & Docker Compose (Containerized environment)
- **Documentation**: Swagger (API Documentation)


## 🚀 Features

### 🏗 Backend API Endpoints:

1. **POST /UrlShortener (Create Short URL)**
   - 🔍 **Purpose**: Generates a short URL from a long URL and stores it in MongoDB and Redis.

2. **GET /UrlShortener/:slug (Retrieve Original URL)**
   - 🔍 **Purpose**: Returns the original URL based on the short URL slug.

3. **Rate Limiting**
   - ⚙️ **How it works**:
     - Max Requests: 100 requests per 15 minutes per IP.

---

## ⚡️ Installation & Setup

### 🛠 Prerequisites
1. Ensure the following are installed on your system:
   - **Docker** and **Docker Compose**
   - **Node.js** (v18 or higher)
2. Clone the repository:
   ```bash
   git clone git@github.com:ZavenPetrosyan/UrlShortener.git
3. Ensure you have the .env files properly configured for both services:
   ```bash
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

## 🎨 Frontend Setup & Running

### 📌 Running Frontend Locally

   1. Navigate to the frontend folder:
      ```bash
      cd frontend
   2. Install dependencies:
      ```bash
      npm install
   3. Start the frontend:
      ```bash 
      npm run start
   4. Open your browser and go to:
      ```bash
      http://localhost:3001
