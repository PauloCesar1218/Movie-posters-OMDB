# OMDB API Proxy

Backend proxy server for OMDB API calls. Keeps API keys secure on the server side.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env-example` to `.env`:
```bash
cp .env-example .env
```

3. Update `.env` with your configuration:
```
PORT=3000
OMDB_API_KEY=your_api_key_here
OMDB_API_URL=https://www.omdbapi.com
ALLOWED_ORIGINS=http://localhost,http://127.0.0.1,file://
```

**Note**: `ALLOWED_ORIGINS` should be a comma-separated list of allowed origins for CORS. Add your production domain when deploying.

## Running

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### GET /api/search
Search for movies by title.

**Query Parameters:**
- `s` - Search query (required, min 2 characters)

**Example:**
```
GET /api/search?s=batman
```

### GET /api/details
Get movie details by IMDB ID.

**Query Parameters:**
- `i` - IMDB ID (required)

**Example:**
```
GET /api/details?i=tt0468569
```

## Security Features

- **API Key Protection**: API keys stored in `.env` file (not committed to git)
- **Rate Limiting**: 
  - General: 100 requests per 15 minutes per IP
  - Search: 50 requests per 15 minutes per IP
  - Details: 200 requests per 15 minutes per IP
- **CORS Protection**: Only allows requests from whitelisted origins
- **Input Validation**: 
  - Search queries: 2-100 characters, XSS pattern detection
  - IMDB IDs: Format validation (tt\d+)
- **Request Timeouts**: 10 second timeout on external API calls
- **Security Headers**: Helmet.js for XSS protection, content type sniffing prevention, etc.
- **Request Size Limits**: 10KB limit on request bodies
- **Environment Validation**: Server exits if required environment variables are missing

