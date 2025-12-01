# OMDB API Proxy

Simple backend proxy server for OMDB API calls. Keeps API keys secure on the server side. Since this backend wasn't my focus, I kept it simple with just some basic security measures like CORS, Rate limiting and a few others.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env-example` to `.env`:
```bash
cp .env-example .env
```

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
- `s` - Search query (required, min 3 characters)

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
- **General Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Only allows requests from whitelisted origins
- **Input Validation**: 
  - Search queries: 3-100 characters, XSS pattern detection
  - IMDB IDs: Format validation (tt\d+)
- **Request Timeouts**: 10 second timeout on external API calls
- **Security Headers**: Helmet.js for XSS protection, content type sniffing prevention, etc.
- **Request Size Limits**: 10KB limit on request bodies
- **Environment Validation**: Server exits if required environment variables are missing

