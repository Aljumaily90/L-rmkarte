const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const NodeCache = require('node-cache');
const fs = require('fs'); // Modul zum Lesen von Dateien
const path = require('path'); // Modul zum Verwalten von Pfaden

const app = express();
const port = 3000;

// Sicherheits- und Performance-Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Konfiguration der Content Security Policy (CSP)
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
            "'self'", 
            "https://code.jquery.com", 
            "https://unpkg.com", 
            "https://cdnjs.cloudflare.com", 
            "https://cdn.jsdelivr.net"
        ],
        styleSrc: [
            "'self'",
            "'unsafe-inline'",  // Ermöglicht die Verwendung von Inline-Styles
            "https://cdnjs.cloudflare.com",
            "https://unpkg.com",
            "https://cdn.jsdelivr.net"
        ],
        imgSrc: [
            "'self'", 
            "data:", 
            "https://unpkg.com", 
            "https://wmts1.geo.admin.ch",  // Erlaubt Bilder von dieser Domain
            "https://wmts2.geo.admin.ch",  // Erlaubt Bilder von dieser Domain
            "https://wmts3.geo.admin.ch",  // Erlaubt Bilder von dieser Domain
            "https://wmts4.geo.admin.ch",   // Erlaubt Bilder von dieser Domain
            "https://a.tile.opentopomap.org",
            "https://b.tile.opentopomap.org",
            "https://c.tile.opentopomap.org",
            "https://server.arcgisonline.com" // Esri World Imagery hinzufügen

        ],
        connectSrc: [
            "'self'",
            "https://nominatim.openstreetmap.org",
            "https://wmts.geo.admin.ch" // Erlaubt Verbindungen zu diesem API-Server
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
    }
}));
// Statische Dateien aus dem 'public' Verzeichnis bereitstellen
app.use(express.static('public'));

// Caching für API-Antworten
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

const cacheMiddleware = (req, res, next) => {
    const key = req.originalUrl;
    const cachedResponse = cache.get(key);
    if (cachedResponse) {
        res.json(cachedResponse);
    } else {
        res.sendResponse = res.json;
        res.json = (body) => {
            cache.set(key, body);
            res.sendResponse(body);
        };
        next();
    }
};

// Funktion zum Laden von JSON-Daten
const loadJSON = (filePath) => {
    try {
        const jsonData = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error(`Fehler beim Laden der Datei ${filePath}:`, error);
        return null;
    }
};

// API-Endpunkte mit Daten aus JSON-Dateien

/// API-Endpunkt für Spitaldaten
app.get('/api/spitaldaten', cacheMiddleware, (req, res) => {
    const spitalDaten = loadJSON('./public/api/spitaldaten.json');
    if (spitalDaten) {
        res.json(spitalDaten);
    } else {
        res.status(500).json({ error: 'Fehler beim Laden der Spitaldaten' });
    }
});

// API-Endpunkt für Spielplätze
app.get('/api/playgrounds', cacheMiddleware, (req, res) => {
    const playgroundsDaten = loadJSON('./public/api/playgrounds.json');
    if (playgroundsDaten) {
        res.json(playgroundsDaten);
    } else {
        res.status(500).json({ error: 'Fehler beim Laden der Spielplatzdaten' });
    }
});

app.get('/api/schools', cacheMiddleware, (req, res) => {
    const schoolsDaten = loadJSON('./public/api/schools.json');
    if (schoolsDaten) {
        res.json(schoolsDaten);
    } else {
        res.status(500).json({ error: 'Fehler beim Laden der Schuldaten' });
    }
});

app.get('/api/churches', cacheMiddleware, (req, res) => {
    const churchesDaten = loadJSON('/public/api/churches.json');
    if (churchesDaten) {
        res.json(churchesDaten);
    } else {
        res.status(500).json({ error: 'Fehler beim Laden der Kirchendaten' });
    }
});

app.get('/api/construction', cacheMiddleware, (req, res) => {
    const constructionDaten = loadJSON('/public/api/construction.json');
    if (constructionDaten) {
        res.json(constructionDaten);
    } else {
        res.status(500).json({ error: 'Fehler beim Laden der Baustellendaten' });
    }
});

// Fehlerbehandlung für nicht gefundene Routen
app.use((req, res) => {
    res.status(404).json({ error: "Route nicht gefunden" });
});

// Server starten
app.listen(port, () => {
    console.log(`Server läuft auf http://localhost:${port}`);
});
