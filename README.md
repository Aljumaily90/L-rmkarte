Lärmkarte Schweiz
Projektübersicht
Die Lärmkarte Schweiz ist eine Webanwendung, die eine interaktive Karte bietet, auf der verschiedene Lärmquellen wie Straßenverkehrslärm, Eisenbahnlärm sowie andere Points of Interest (POIs) wie Spitäler, Kirchen, Baustellen, Flughäfen und Militärflugplätze angezeigt werden können. Benutzer können zwischen verschiedenen Kartenansichten wechseln und bestimmte Filter aktivieren, um bestimmte Daten sichtbar zu machen.

Hauptfunktionen
Lärmquellen anzeigen:

Straßenverkehrslärm (Tag/Nacht).
Eisenbahnlärm (Tag/Nacht).
Auswahl und Umschaltung der Lärmquellen mittels Schieberegler und Checkboxen.
Filter für Points of Interest:

Spitäler.
Kirchen.
Baustellen.
Militärflugplätze.
Flughäfen.
Kartenansichten:

Standardkarte.
Satellitenansicht.
Schwarz-Weiß-Karte.
Standortanzeige:

Ein Button, der den aktuellen Standort des Benutzers auf der Karte anzeigt.
Installation
Voraussetzungen
Node.js und npm müssen auf dem System installiert sein.
Optional: Browser, der moderne JavaScript- und CSS-Standards unterstützt (z.B. Chrome, Firefox).
Schritte zur Installation
Code herunterladen:

bash
Code kopieren
git clone <repository-url>
cd Laermkarte-server
Benötigte Pakete installieren: Führe den folgenden Befehl aus, um alle Abhängigkeiten zu installieren:

bash
Code kopieren
npm install
Starten des Servers: Der Server wird auf Port 3000 gestartet:

bash
Code kopieren
node server.js
Zugriff auf die Anwendung: Öffne einen Webbrowser und gehe zu:

arduino
Code kopieren
http://localhost:3000
Dateistruktur
graphql
Code kopieren
Laermkarte-server/
│
├── public/
│   ├── css/
│   │   └── style.css           # Stile für das Layout und das Design der Anwendung
│   ├── images/
│   │   └── ...                 # Icons für die verschiedenen Lärmquellen und Kartenansichten
│   └── js/
│       └── script.js           # Haupt-JavaScript-Datei für die Funktionslogik
├── server.js                   # Hauptserverdatei (Express.js)
├── api/
│   ├── spitaldaten.json         # JSON-Datei mit den Spitaldaten
│   ├── military_airports.json   # JSON-Datei mit Militärflugplätzen
│   ├── airports.json            # JSON-Datei mit Flughafendaten
│   ├── churches.json            # JSON-Datei mit Kirchendaten
│   └── construction.json        # JSON-Datei mit Baustellendaten
└── README.md                   # Dokumentation der Anwendung
API-Endpunkte
Die Anwendung bietet mehrere API-Endpunkte, um die verschiedenen Points of Interest als JSON-Daten bereitzustellen. Diese Daten werden dann von der Karte verwendet, um Marker auf der Karte anzuzeigen.

/api/spitaldaten: Liefert die Daten aller Spitäler.
/api/military_airports: Liefert die Daten aller Militärflugplätze.
/api/airports: Liefert die Daten aller Flughäfen.
/api/churches: Liefert die Daten aller Kirchen.
/api/construction: Liefert die Daten aller Baustellen.
Wichtige Funktionen
1. Lärmquellen und Schieberegler
Der Schieberegler für Straßenlärm und Zuglärm wird nur angezeigt, wenn die zugehörige Checkbox aktiviert ist. Es gibt separate Schieberegler für Tag- und Nachtlärm.

2. Kartenansichten wechseln
Nutzer können zwischen der Standardansicht, der Satellitenansicht und einer Schwarz-Weiß-Ansicht wechseln. Dies geschieht über ein Dropdown-Menü, das mit Icons gestaltet ist.

3. Marker-Cluster
Die Marker (für Spitäler, Kirchen, etc.) sind in Gruppen organisiert, um die Karte übersichtlich zu halten. Bei näherem Zoomen werden die einzelnen Marker angezeigt.

Verwendung
1. Filter anwenden
Der Nutzer kann die verschiedenen Checkboxen für Spitäler, Kirchen, Baustellen usw. aktivieren, um die entsprechenden Marker auf der Karte anzuzeigen.

2. Zwischen Tag/Nacht wechseln
Für Straßen- und Eisenbahnlärm kann der Nutzer über einen Schieberegler zwischen Tag- und Nachtlärm umschalten. Diese Option wird nur angezeigt, wenn die entsprechende Checkbox aktiviert ist.

3. Kartenansicht ändern
Über ein Dropdown-Menü kann der Nutzer die Kartenansicht ändern. Standardmäßig wird die Standardansicht geladen, es gibt jedoch auch eine Satellitenansicht und eine Schwarz-Weiß-Karte.

Technologien
Node.js: Als Backend-Plattform.
Express.js: Zum Erstellen der API und zum Bereitstellen statischer Dateien.
Leaflet.js: Für die interaktive Karte.
Leaflet.markercluster: Für das Gruppieren von Markern in Clustern.
jQuery: Zum Verarbeiten von Benutzereingaben und dynamischem Datenladen.
Bootstrap: Für das responsive Design und die Navigation.
Zukünftige Verbesserungen
Möglichkeit zur Anzeige historischer Lärmdaten.
Integration von Echtzeit-Datenquellen.
Erweiterung der Filteroptionen um weitere Points of Interest.