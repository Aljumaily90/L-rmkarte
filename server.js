const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const NodeCache = require('node-cache');
const fs = require('fs'); // Modul zum Lesen von Dateien
const path = require('path'); // Modul zum Verwalten von Pfaden
const basicAuth = require('express-basic-auth'); // Basic Auth Middleware


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

// Basic Auth Middleware für die Admin-Seite
app.use('/admin.html', basicAuth({
    users: { 'admin': 'securepassword123' }, // Benutzername: admin, Passwort: securepassword123
    challenge: true, // Zeigt die Authentifizierungsaufforderung im Browser an
    unauthorizedResponse: (req) => 'Zugriff verweigert: Ungültige Anmeldedaten',
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
app.get('/api/hospitals.json', cacheMiddleware, (req, res) => {
    const spitalDaten = loadJSON('/api/hospitals.json');
    if (spitalDaten) {
        res.json(spitalDaten);
    } else {
        res.status(500).json({ error: 'Fehler beim Laden der Spitaldaten' });
    }
});

// API-Endpunkt für Militärflugplätze
app.get('/api/military_airports', cacheMiddleware, (req, res) => {
    const militaryAirportsDaten = loadJSON('/api/military_airports.json');
    if (militaryAirportsDaten) {
        res.json(militaryAirportsDaten);
    } else {
        res.status(500).json({ error: 'Fehler beim Laden der Militärflugplätze-Daten' });
    }
});

// API-Endpunkt für Flughäfen
app.get('/api/airports', cacheMiddleware, (req, res) => {
    const airportsDaten = loadJSON('/api/airports.json');
    if (airportsDaten) {
        res.json(airportsDaten);
    } else {
        res.status(500).json({ error: 'Fehler beim Laden der Flughäfen-Daten' });
    }
});


app.get('/api/churches', cacheMiddleware, (req, res) => {
    const churchesDaten = loadJSON('/api/churches.json');
    if (churchesDaten) {
        res.json(churchesDaten);
    } else {
        res.status(500).json({ error: 'Fehler beim Laden der Kirchendaten' });
    }
});

app.get('/api/construction', cacheMiddleware, (req, res) => {
    const constructionDaten = loadJSON('/api/construction.json');
    if (constructionDaten) {
        res.json(constructionDaten);
    } else {
        res.status(500).json({ error: 'Fehler beim Laden der Baustellendaten' });
    }
});

// API-Endpunkt für Pending-Daten
app.get('/api/pending.json', cacheMiddleware, (req, res) => {
    const pendingData = loadJSON('./api/pending.json');
    if (pendingData) {
        res.json(pendingData);
    } else {
        res.status(500).json({ error: 'Fehler beim Laden der Pending-Daten' });
    }
});
app.post('/api/add-noise-source', (req, res) => {
    const { coordinates, category, name, endDate } = req.body;

    if (!coordinates || !category || !name) {
        return res.status(400).json({
            error: 'Ungültige Anfrage. Koordinaten, Kategorie und Name sind erforderlich.'
        });
    }

    // Warteschlange-Datei
    const pendingFilePath = '/api/pending.json';

    try {
        // Bestehende Warteschlange laden oder leeres Array erstellen
        const pendingData = loadJSON(pendingFilePath) || [];

        // Automatische ID für die Warteschlange
        const newId = pendingData.length > 0
            ? Math.max(...pendingData.map(item => item.id)) + 1
            : 1;

        // Neues Objekt erstellen
        const newEntry = {
            id: newId,
            name: name,
            category: category,
            lat: coordinates[0],
            lon: coordinates[1],
            status: 'pending' // Status 'pending' für noch nicht genehmigte Einträge
        };

        // Enddatum nur für Baustellen hinzufügen
        if (category === 'construction' && endDate) {
            newEntry.end_date = endDate;
        }

        // Neues Objekt in die Warteschlange hinzufügen
        pendingData.push(newEntry);
        saveJSON(pendingFilePath, pendingData);

        res.json({
            success: true,
            message: 'Lärmquelle erfolgreich zur Überprüfung eingereicht!',
            data: newEntry
        });
    } catch (error) {
        console.error(`Fehler beim Speichern in die Warteschlange:`, error);
        res.status(500).json({ error: 'Fehler beim Speichern der Daten.' });
    }
});

app.post('/api/approve-noise-source', (req, res) => {
    const { id, approve } = req.body;

    if (typeof id === 'undefined' || typeof approve === 'undefined') {
        return res.status(400).json({
            error: 'Ungültige Anfrage. ID und Genehmigungsstatus sind erforderlich.'
        });
    }

    const pendingFilePath = '/api/pending.json';

    try {
        // Warteschlange laden
        const pendingData = loadJSON(pendingFilePath) || [];
        const entryIndex = pendingData.findIndex(item => item.id === id);

        if (entryIndex === -1) {
            return res.status(404).json({
                error: 'Eintrag mit der angegebenen ID nicht gefunden.'
            });
        }

        const entry = pendingData[entryIndex];

        if (approve) {
            // Genehmigen: In die richtige Kategorie-Datei verschieben
            const filePath = `/api/${entry.category}.json`;
            const categoryData = loadJSON(filePath) || [];

            // Entferne den Status für genehmigte Einträge
            delete entry.status;

            categoryData.push(entry);
            saveJSON(filePath, categoryData);

            res.json({ success: true, message: 'Lärmquelle genehmigt und hinzugefügt!', data: entry });
        } else {
            // Ablehnen: Eintrag bleibt nicht gespeichert
            res.json({ success: true, message: 'Lärmquelle wurde abgelehnt!', data: entry });
        }

        // Eintrag aus der Warteschlange entfernen
        pendingData.splice(entryIndex, 1);
        saveJSON(pendingFilePath, pendingData);
    } catch (error) {
        console.error(`Fehler beim Genehmigen/Ablehnen der Lärmquelle:`, error);
        res.status(500).json({ error: 'Fehler beim Verarbeiten der Anfrage.' });
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