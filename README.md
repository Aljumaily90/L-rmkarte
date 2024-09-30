Lärmkarte Schweiz
Eine interaktive Webanwendung zur Visualisierung und Analyse von Lärmdaten in der Schweiz. Die Anwendung zeigt verschiedene Lärmquellen sowie relevante Punkte wie Spitäler, Schulen und Baustellen auf einer Karte an.

Inhaltsverzeichnis
Installation
Verwendung
Projektstruktur
Funktionalitäten
Performance-Optimierung
Weiterentwicklung
Lizenz
Installation
Voraussetzungen
Node.js (Version 12 oder höher)
NPM (Node Package Manager)
Lokale Installation
Repository klonen

bash
Code kopieren
git clone https://github.com/dein-benutzername/laermkarte.git
In das Projektverzeichnis wechseln

bash
Code kopieren
cd laermkarte
Abhängigkeiten installieren

bash
Code kopieren
npm install
Server starten

bash
Code kopieren
node server.js
Webanwendung im Browser öffnen

Die Anwendung läuft jetzt unter http://localhost:3000.
Verwendung
Die Lärmkarte bietet verschiedene Funktionen zur Visualisierung und Analyse von Lärmdaten in der Schweiz:

Adresssuche: Geben Sie eine Adresse in das Suchfeld ein, um diese auf der Karte zu finden.
Lärmquellen anzeigen: Aktivieren Sie die Checkboxen, um verschiedene Lärmquellen wie Straßenlärm, Spitäler, Schulen, Baustellen, usw. auf der Karte anzuzeigen.
Filter: Verwenden Sie die Filteroptionen im Offcanvas-Menü, um die angezeigten Lärmquellen zu filtern.
Projektstruktur
graphql
Code kopieren
laermkarte/
│
├── api/                    # Enthält JSON-Dateien mit Daten zu Spitälern, Schulen, etc.
│   ├── spitaldaten.json
│   ├── playgrounds.json
│   ├── schools.json
│   ├── churches.json
│   └── construction.json
│
├── images/                 # Bilder und Icons für die Marker
│   ├── hospital-icon.png
│   ├── playground-icon.png
│   ├── school-icon.png
│   ├── church-icon.png
│   └── construction-icon.png
│
├── public/                 # Statische Dateien (CSS, JS)
│   ├── css/
│   │   └── style.css       # Custom CSS für die Webseite
│   ├── js/
│   │   └── script.js       # Haupt-JavaScript-Datei für die Karte und Funktionen
│   └── index.html          # Haupt-HTML-Datei
│
├── server.js               # Hauptserver-Datei mit API-Endpunkten und Konfiguration
├── package.json            # Projektinformationen und Abhängigkeiten
└── README.md               # Diese README-Datei
Funktionalitäten
1. Interaktive Karte
Darstellung einer interaktiven Karte basierend auf Swisstopo-Daten.
Kartenebenen für Straßenlärm und weitere Lärmquellen.
2. Marker und Layer
Marker für verschiedene Lärmquellen wie Spitäler, Schulen, Spielplätze und Baustellen.
Dynamisches Hinzufügen und Entfernen von Markern basierend auf der Nutzerinteraktion.
3. Adresssuche
Integration der Nominatim API von OpenStreetMap für die Adresssuche.
Vorschläge und automatische Vervollständigung während der Eingabe.
4. Filter und Suchfunktionen
Filtermenü zur Auswahl von Lärmquellen, die auf der Karte angezeigt werden.
Suchformular zur gezielten Adresssuche.
5. Performance-Optimierungen
Marker-Cluster zur Reduzierung der angezeigten Markeranzahl.
Caching von Daten mit NodeCache zur Reduzierung von API-Anfragen.
Lazy Loading und Debouncing bei der Adresssuche.
Performance-Optimierung
Lazy Loading und Debouncing:

Lade Ressourcen wie Marker und Kartenlayer erst bei Bedarf.
Verwende Debouncing, um die Anzahl der API-Anfragen bei der Adresssuche zu reduzieren.
Marker Clustering:

Verwende MarkerCluster, um die Anzeige der Marker zu optimieren und die Kartenperformance zu verbessern.
Caching im Browser und Server:

Implementiere Browser-Caching für statische Ressourcen und API-Caching auf dem Server.
Minimierung von Dateien:

Minimiere und kombiniere CSS- und JavaScript-Dateien, um die Ladezeiten zu reduzieren.
Weiterentwicklung
Datenaktualisierung: Integration von Echtzeitdaten zur Aktualisierung der Lärmquellen.
Erweiterte Filter: Erweiterung der Filtermöglichkeiten, z. B. nach Lärmintensität oder Zeit.
Benutzerfreundlichkeit: Verbesserung der Benutzeroberfläche und Einführung zusätzlicher Funktionen wie ein Dark Mode.
Performance-Optimierungen: Weitere Optimierungen bei der Ladegeschwindigkeit und beim Datenhandling.
Lizenz
Dieses Projekt steht unter der MIT-Lizenz. Weitere Informationen finden Sie in der LICENSE-Datei.

