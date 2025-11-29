require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_API_URL = process.env.OMDB_API_URL;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost', 'http://127.0.0.1', 'file://'];

if (!OMDB_API_KEY) {
    console.error('ERROR: OMDB_API_KEY is not set in environment variables');
    process.exit(1);
}

if (!OMDB_API_URL) {
    console.error('ERROR: OMDB_API_URL is not set in environment variables');
    process.exit(1);
}

app.use(helmet());
app.use(express.json({ limit: '10kb' }));

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed))) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { Response: 'False', Error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { Response: 'False', Error: 'Too many search requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const detailsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { Response: 'False', Error: 'Too many detail requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api', generalLimiter);

function validateSearchQuery(query) {
    if (!query || typeof query !== 'string') {
        return { valid: false, error: 'Invalid search query' };
    }
    
    const trimmed = query.trim();
    
    if (trimmed.length < 3) {
        return { valid: false, error: 'Search query must be at least 3 characters' };
    }
    
    if (trimmed.length > 100) {
        return { valid: false, error: 'Search query must be no more than 100 characters' };
    }
    
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(trimmed)) {
            return { valid: false, error: 'Invalid characters in search query' };
        }
    }
    
    return { valid: true, query: trimmed };
}

function validateImdbId(imdbId) {
    if (!imdbId || typeof imdbId !== 'string') {
        return { valid: false, error: 'Invalid IMDB ID' };
    }
    
    const trimmed = imdbId.trim();
    
    if (!/^tt\d+$/.test(trimmed)) {
        return { valid: false, error: 'Invalid IMDB ID format' };
    }
    
    if (trimmed.length > 20) {
        return { valid: false, error: 'IMDB ID is too long' };
    }
    
    return { valid: true, id: trimmed };
}

async function fetchWithTimeout(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Request timeout'));
        }, timeout);
        
        fetch(url)
            .then(response => {
                clearTimeout(timeoutId);
                resolve(response);
            })
            .catch(error => {
                clearTimeout(timeoutId);
                reject(error);
            });
    });
}

app.get('/api/search', searchLimiter, async (req, res) => {
    try {
        const { s } = req.query;
        
        const validation = validateSearchQuery(s);
        if (!validation.valid) {
            return res.status(400).json({ 
                Response: 'False', 
                Error: validation.error 
            });
        }
        
        const url = `${OMDB_API_URL}/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(validation.query)}`;
        const response = await fetchWithTimeout(url);
        
        if (!response.ok) {
            throw new Error(`OMDB API returned status ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        if (error.message === 'Request timeout') {
            return res.status(504).json({ 
                Response: 'False', 
                Error: 'Request timeout. Please try again.' 
            });
        }
        
        console.error('Search error:', error.message);
        res.status(500).json({ 
            Response: 'False', 
            Error: 'Failed to search movies' 
        });
    }
});

app.get('/api/details', detailsLimiter, async (req, res) => {
    try {
        const { i } = req.query;
        
        const validation = validateImdbId(i);
        if (!validation.valid) {
            return res.status(400).json({ 
                Response: 'False', 
                Error: validation.error 
            });
        }
        
        const url = `${OMDB_API_URL}/?apikey=${OMDB_API_KEY}&i=${encodeURIComponent(validation.id)}`;
        const response = await fetchWithTimeout(url);
        
        if (!response.ok) {
            throw new Error(`OMDB API returned status ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        if (error.message === 'Request timeout') {
            return res.status(504).json({ 
                Response: 'False', 
                Error: 'Request timeout. Please try again.' 
            });
        }
        
        console.error('Details error:', error.message);
        res.status(500).json({ 
            Response: 'False', 
            Error: 'Failed to fetch movie details' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});
