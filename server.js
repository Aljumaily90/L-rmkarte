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

// Middleware für JSON-Daten aktivieren
app.use(express.json()); // **WICHTIG: JSON-Daten aus POST-Requests parsen**
app.use(express.urlencoded({ extended: true })); // Optional: Formulardaten parsen

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

// Funktion zum Speichern von JSON-Daten
const saveJSON = (filePath, data) => {
    try {
        fs.writeFileSync(path.join(__dirname, filePath), JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Fehler beim Speichern der Datei ${filePath}:`, error);
        throw error;
    }
};

// API-Endpunkte mit Daten aus JSON-Dateien

/// API-Endpunkt für Spitaldaten
app.get('/api/hospitals', cacheMiddleware, (req, res) => {
    const spitalDaten = loadJSON('./public/api/hospitals.json');
    if (spitalDaten) {
        res.json(spitalDaten);
    } else {
        res.status(500).json({ error: 'Fehler beim Laden der Spitaldaten' });
    }
});

// API-Endpunkt für Militärflugplätze
app.get('/api/military_airports', cacheMiddleware, (req, res) => {
    const militaryAirportsDaten = loadJSON('./public/api/military_airports.json');
    if (militaryAirportsDaten) {
        res.json(militaryAirportsDaten);
    } else {
        res.status(500).json({ error: 'Fehler beim Laden der Militärflugplätze-Daten' });
    }
});

// API-Endpunkt für Flughäfen
app.get('/api/airports', cacheMiddleware, (req, res) => {
    const airportsDaten = loadJSON('./public/api/airports.json');
    if (airportsDaten) {
        res.json(airportsDaten);
    } else {
        res.status(500).json({ error: 'Fehler beim Laden der Flughäfen-Daten' });
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

app.post('/api/save-data', (req, res) => {
    const { coordinates, category, name = 'Neues Objekt', endDate } = req.body;

    // Prüfung: Sind die erforderlichen Felder vorhanden?
    if (!coordinates || !category) {
        return res.status(400).json({
            error: 'Ungültige Anfrage. Koordinaten und Kategorie sind erforderlich.'
        });
    }

    // Datei basierend auf der Kategorie auswählen
    const filePath = `./public/api/${category}.json`;

    try {
        // Bestehende Daten laden oder leeres Array erstellen
        const existingData = loadJSON(filePath) || [];

        // Automatische ID-Berechnung (höchste ID + 1 oder ID = 1, falls leer)
        const newId = existingData.length > 0
            ? Math.max(...existingData.map(item => item.id)) + 1
            : 1;

        // Neuen Eintrag erstellen
        const newEntry = {
            id: newId,
            name: name, // Falls kein Name angegeben ist, wird 'Neues Objekt' verwendet
            lat: coordinates[0],
            lon: coordinates[1]
        };

        // Falls Kategorie 'construction', füge `endDate` hinzu
        if (category === 'construction' && endDate) {
            newEntry.end_date = endDate;
        }

        // Neuen Eintrag hinzufügen und speichern
        existingData.push(newEntry);
        saveJSON(filePath, existingData);

        // Erfolgsmeldung zurücksenden
        res.json({
            success: true,
            message: 'Daten erfolgreich gespeichert!',
            data: newEntry
        });
    } catch (error) {
        console.error(`Fehler beim Speichern der Daten:`, error);
        res.status(500).json({ error: 'Fehler beim Speichern der Daten.' });
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