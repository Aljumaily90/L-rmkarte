/******************************************** Main**************************************** */
// Initialisiere die Variable 'marker' global, damit sie in allen Funktionen verwendet werden kann
var marker;
var searchCache = {};  // Cache für Suchanfragen

// Initialisiere die Karte
const map = L.map('map').setView([46.8182, 8.2275], 8);

// Initialisierung der Kartenansichten
var standardLayer = L.tileLayer('https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg', {
    minZoom: 9,
    maxZoom: 21,
    updateWhenIdle: true, // Tiles werden nur dann aktualisiert, wenn die Karte ruhig ist.
    useCache: true, // Caching aktivieren (erfordert ein entsprechendes Plugin)
    subdomains: '123',
    noWrap: true, // Verhindert das Wiederholen der Karte
    attribution: '&copy; <a href="https://www.swisstopo.admin.ch/de/home.html">swisstopo</a>'
});
// Swisstopo Satellitenansicht
var satelliteLayer = L.tileLayer('https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg', {
    maxZoom: 21,
    minZoom: 9,
    updateWhenIdle: true, // Tiles werden nur dann aktualisiert, wenn die Karte ruhig ist.
    useCache: true, // Caching aktivieren (erfordert ein entsprechendes Plugin)
    subdomains: '123',
    attribution: '&copy; <a href="https://www.swisstopo.admin.ch/de/home.html">swisstopo</a>'
});

// Schwarz-Weiß-Karte von Swisstopo
var grayscaleLayer = L.tileLayer('https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg', {
    maxZoom: 21,
    minZoom: 9,
    updateWhenIdle: true,
    useCache: true,
    subdomains: '123',
    attribution: '&copy; <a href="https://www.swisstopo.admin.ch/de/home.html">swisstopo</a>'
});
// Standard-Karte beim Laden hinzufügen
map.addLayer(standardLayer);

// Eventlistener zum Wechseln der Kartenansicht
function changeMapLayer(newLayer) {
    // Entferne alle Layer
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });

    // Füge die neue Kartenansicht hinzu
    map.addLayer(newLayer);

    // Überprüfe, ob Straßenlärm aktiviert ist
    if ($('#filterNoise').is(':checked')) {
        if ($('#dayNightToggle').is(':checked')) {
            map.addLayer(nightNoiseLayer); // Füge den Nacht-Lärm-Layer hinzu
        } else {
            map.addLayer(dayNoiseLayer); // Füge den Tag-Lärm-Layer hinzu
        }
    }

    // Überprüfe, ob Zuglärm aktiviert ist
    if ($('#filterTrainNoise').is(':checked')) {
        if ($('#trainDayNightToggle').is(':checked')) {
            map.addLayer(trainNightNoiseLayer); // Füge den Nacht-Zuglärm-Layer hinzu
        } else {
            map.addLayer(trainDayNoiseLayer); // Füge den Tag-Zuglärm-Layer hinzu
        }
    }
    // Überprüfe und füge Marker und Lärmradius für Spitäler hinzu
    if ($('#filterHospitals').is(':checked')) {
        map.addLayer(clusterGroups.hospital); // Marker hinzufügen
        noiseLayers.hospital.forEach(circle => circle.addTo(map)); // Lärmradius hinzufügen
    }
    // Überprüfe und füge Marker und Lärmradius für Kirchen hinzu
    if ($('#filterChurches').is(':checked')) {
        map.addLayer(clusterGroups.church); // Marker hinzufügen
        noiseLayers.church.forEach(circle => circle.addTo(map)); // Lärmradius hinzufügen
    }

    // Überprüfe und füge Marker und Lärmradius für Baustellen hinzu
    if ($('#filterConstruction').is(':checked')) {
        map.addLayer(clusterGroups.construction); // Marker hinzufügen
        noiseLayers.construction.forEach(circle => circle.addTo(map)); // Lärmradius hinzufügen
    }

    // Überprüfe und füge Marker und Lärmradius für Militärflugplätze hinzu
    if ($('#filterMilitaryAirports').is(':checked')) {
        map.addLayer(clusterGroups.militaryAirport); // Marker hinzufügen
        noiseLayers.militaryAirport.forEach(circle => circle.addTo(map)); // Lärmradius hinzufügen
    }

    // Überprüfe und füge Marker und Lärmradius für Flughäfen hinzu
    if ($('#filterAirports').is(':checked')) {
        map.addLayer(clusterGroups.airport); // Marker hinzufügen
        noiseLayers.airport.forEach(circle => circle.addTo(map)); // Lärmradius hinzufügen
    }
}


// Event-Listener für das Wechseln der Kartenansicht
document.getElementById('standardView').addEventListener('click', function (e) {
    e.preventDefault();
    changeMapLayer(standardLayer);
    updateActiveButton(this);
});

document.getElementById('satelliteView').addEventListener('click', function (e) {
    e.preventDefault();
    changeMapLayer(satelliteLayer);
    updateActiveButton(this);
});

document.getElementById('grayscaleView').addEventListener('click', function (e) {
    e.preventDefault();
    changeMapLayer(grayscaleLayer);
    updateActiveButton(this);
});

// Funktion zum Wechseln der Kartenansicht und Setzen der aktiven Klasse
function updateActiveButton(activeButton) {
    // Entferne die 'active'-Klasse von allen Dropdown-Items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
    });

    // Füge die 'active'-Klasse nur dem geklickten Button hinzu
    activeButton.classList.add('active');
}

// Hinweis anzeigen beim ersten Wechsel
if (!localStorage.getItem('viewChangeHintShown')) {
    alert('Wechseln Sie zwischen den Kartenansichten mit den Optionen oben.');
    localStorage.setItem('viewChangeHintShown', 'true');
}
/**************************************************************************************************/
/*************************************** Modal und Dropdown-Logik *********************************/
// Öffne Modal bei Klick auf die Karte 
map.on('click', (e) => {
    const { lat, lng } = e.latlng;

    // Zeige Modal an und aktualisiere Koordinaten
    document.getElementById('selectedCoordinates').textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    const categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));
    categoryModal.show();
});

// Enddatum-Feld dynamisch anzeigen, wenn Baustellen ausgewählt werden
document.getElementById('categorySelect').addEventListener('change', function (e) {
    const selectedCategory = e.target.value;
    const constructionField = document.getElementById('constructionDateField');

    if (selectedCategory === 'construction') {
        constructionField.classList.remove('d-none');
    } else {
        constructionField.classList.add('d-none');
    }
});

// Daten senden (Modal-Button)
document.getElementById('submitCategory').addEventListener('click', function () {
    const coordinates = document.getElementById('selectedCoordinates').textContent;
    const category = document.getElementById('categorySelect').value;
    const name = document.getElementById('noiseSourceName').value.trim(); // Neues Feld für den Namen
    const endDate = document.getElementById('constructionEndDate').value;

    // Validierung der Eingaben
    if (!category) {
        alert('Bitte wählen Sie eine Kategorie aus!');
        return;
    }
    if (!name) {
        alert('Bitte geben Sie einen Namen für die Lärmquelle ein!');
        return;
    }

    // Erstelle das Datenobjekt
    const data = {
        coordinates: coordinates.split(',').map(coord => parseFloat(coord.trim())),
        category: category,
        name: name, // Name wird vom Nutzer eingegeben
        endDate: category === 'construction' ? endDate : null, // Enddatum nur für Baustellen
    };

    // Sende die Daten an das Backend
    fetch('./api/add-noise-source', { // Verwende den neuen Endpunkt
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Fehler: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            alert('Die Lärmquelle wurde erfolgreich zur Überprüfung eingereicht!');
            console.log(result); // Zeigt die Antwort des Servers
        })
        .catch(error => {
            alert('Fehler beim Einreichen der Lärmquelle.');
            console.error(error);
        });

    // Schließe das Modal
    const categoryModal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
    if (categoryModal) {
        categoryModal.hide();
    }
});

/************************************************************************************ */
/******************************************** Strassen Lärem**************************************** */
// Erfasse den Schieberegler, die Checkbox und die Layer für Tag/Nacht-Lärm
var dayNightToggle = document.querySelector('.day-night-toggle'); // Der Schieberegler für Tag/Nacht
var dayNightToggle = document.querySelector('.day-night-toggle'); // Der Schieberegler für Tag/Nacht
var noiseCheckbox = document.getElementById('filterNoise'); // Die Checkbox für Straßenlärm

var dayNoiseLayer = L.tileLayer('https://wmts{s}.geo.admin.ch/1.0.0/ch.bafu.laerm-strassenlaerm_tag/default/current/3857/{z}/{x}/{y}.png', {
    minZoom: 9,
    maxZoom: 20,
    subdomains: '1234',
    opacity: 0.7,
    attribution: '&copy; <a href="https://www.bafu.admin.ch/bafu/de/home/themen/laerm.html">BAFU</a>'
});

var nightNoiseLayer = L.tileLayer('https://wmts{s}.geo.admin.ch/1.0.0/ch.bafu.laerm-strassenlaerm_nacht/default/current/3857/{z}/{x}/{y}.png', {
    minZoom: 9,
    maxZoom: 20,
    subdomains: '1234',
    opacity: 0.7,
    attribution: '&copy; <a href="https://www.bafu.admin.ch/bafu/de/home/themen/laerm.html">BAFU</a>'
});


// Event-Listener für die Straßenlärm-Checkbox
$('#filterNoise').change(function() {
    var dayNightToggle = document.querySelector('.day-night-toggle'); // Der Schieberegler für Straßenlärm Tag/Nacht
    var dayNightLabel = document.getElementById('dayNightLabel'); // Label für Tag/Nacht (Straßenlärm)


    if (this.checked) {
        // Checkbox ist aktiviert, Schieberegler anzeigen
        dayNightToggle.classList.add('show-toggle'); // Schieberegler anzeigen

        // Wenn der Schieberegler auf "Nacht" steht, den Nacht-Layer hinzufügen
        if ($('#dayNightToggle').is(':checked')) {
            map.addLayer(nightNoiseLayer);
            dayNightLabel.textContent = 'Nacht'; // Zeige "Nacht" an
        } else {
            // Ansonsten den Tag-Layer hinzufügen
            map.addLayer(dayNoiseLayer);
            dayNightLabel.textContent = 'Tag'; // Zeige "Tag" an
        }
    } else {
        // Checkbox ist deaktiviert, Schieberegler verstecken und Layer entfernen
        dayNightToggle.classList.remove('show-toggle'); // Schieberegler verstecken
        map.removeLayer(dayNoiseLayer);
        map.removeLayer(nightNoiseLayer);
    }
});

// Eventlistener für den Tag/Nacht-Schieberegler (Straßenlärm)
$('#dayNightToggle').change(function() {
    var dayNightLabel = document.getElementById('dayNightLabel'); // Label für Tag/Nacht (Straßenlärm)

    if (this.checked) {
        // Nachtmodus aktivieren
        map.removeLayer(dayNoiseLayer);
        map.addLayer(nightNoiseLayer);
        dayNightLabel.textContent = 'Nacht'; // Ändere den Text auf "Nacht"
    } else {
        // Tagmodus aktivieren
        map.removeLayer(nightNoiseLayer);
        map.addLayer(dayNoiseLayer);
        dayNightLabel.textContent = 'Tag'; // Ändere den Text auf "Tag"
    }
});

/************************************************************************************************** */
/***********************Zuglärm Layer für Tag/Nach************************************************ */
// Erfasse die Checkbox für den Zuglärm und den Schieberegler
var trainNoiseCheckbox = document.getElementById('filterTrainNoise'); // Checkbox für Zuglärm
var trainDayNightToggle = document.querySelector('.train-day-night-toggle'); // Der Schieberegler für Zuglärm Tag/Nacht
var trainDayNightLabel = document.getElementById('trainDayNightLabel'); // Label für Tag/Nacht bei Zuglärm

// Definiere die Layer für Zuglärm Tag/Nacht
var trainDayNoiseLayer = L.tileLayer('https://wmts{s}.geo.admin.ch/1.0.0/ch.bafu.laerm-bahnlaerm_tag/default/current/3857/{z}/{x}/{y}.png', {
    minZoom: 8,
    maxZoom: 19,
    subdomains: '1234',
    opacity: 0.7,
    attribution: '&copy; <a href="https://www.bafu.admin.ch/bafu/de/home/themen/laerm.html">BAFU</a>'
});

var trainNightNoiseLayer = L.tileLayer('https://wmts{s}.geo.admin.ch/1.0.0/ch.bafu.laerm-bahnlaerm_nacht/default/current/3857/{z}/{x}/{y}.png', {
    minZoom: 8,
    maxZoom: 19,
    subdomains: '1234',
    opacity: 0.7,
    attribution: '&copy; <a href="https://www.bafu.admin.ch/bafu/de/home/themen/laerm.html">BAFU</a>'
});



// Event-Listener für die Zuglärm-Checkbox
$('#filterTrainNoise').change(function() {
    var trainDayNightToggle = document.querySelector('.train-day-night-toggle'); // Der Schieberegler für Zuglärm Tag/Nacht
    var trainDayNightLabel = document.getElementById('trainDayNightLabel'); // Label für Tag/Nacht (Zuglärm)


    if (this.checked) {
        // Checkbox ist aktiviert, Schieberegler anzeigen
        trainDayNightToggle.classList.add('show-toggle'); // Schieberegler anzeigen

        // Wenn der Schieberegler auf "Nacht" steht, den Nacht-Layer hinzufügen
        if ($('#trainDayNightToggle').is(':checked')) {
            map.addLayer(trainNightNoiseLayer);
            trainDayNightLabel.textContent = 'Nacht'; // Zeige "Nacht" an
        } else {
            // Ansonsten den Tag-Layer hinzufügen
            map.addLayer(trainDayNoiseLayer);
            trainDayNightLabel.textContent = 'Tag'; // Zeige "Tag" an
        }
    } else {
        // Checkbox ist deaktiviert, Schieberegler verstecken und Layer entfernen
        trainDayNightToggle.classList.remove('show-toggle'); // Schieberegler verstecken
        map.removeLayer(trainDayNoiseLayer);
        map.removeLayer(trainNightNoiseLayer);
    }
});

// Eventlistener für den Tag/Nacht-Schieberegler (Zuglärm)
$('#trainDayNightToggle').change(function() {
    var trainDayNightLabel = document.getElementById('trainDayNightLabel'); // Label für Tag/Nacht (Zuglärm)

    if (this.checked) {
        // Nachtmodus aktivieren
        map.removeLayer(trainDayNoiseLayer);
        map.addLayer(trainNightNoiseLayer);
        trainDayNightLabel.textContent = 'Nacht'; // Ändere den Text auf "Nacht"
    } else {
        // Tagmodus aktivieren
        map.removeLayer(trainNightNoiseLayer);
        map.addLayer(trainDayNoiseLayer);
        trainDayNightLabel.textContent = 'Tag'; // Ändere den Text auf "Tag"
    }
});
/************************************************************************************************** */
/************************************************************************************************** */
// Positioniere die Zoom-Steuerungen manuell
L.control.zoom({
    position: 'bottomleft' // Alternativen: 'topleft', 'bottomleft', 'bottomright'
}).addTo(map);

// Entfernt den Zoom-In-Button manuell aus dem DOM
document.querySelector('.leaflet-control-zoom-in').remove();
/************************************************************************************************** */
/***********************************************Koordinaten*************************************************** */

/************************************************************************************************** */
/**************************************************Helper-Funktion************************************************ */
// Helper-Funktion zum Laden von Daten
const fetchData = (url, callback) => {
    $.getJSON(url, callback).fail(() => console.error(`Fehler beim Laden von ${url}`));
};

// Helper-Funktion zum Berechnen der verbleibenden Tage bis zum Enddatum
const calculateDaysRemaining = (endDate) => {
    const currentDate = new Date();
    const end = new Date(endDate);
    const timeDiff = end - currentDate;
    const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysRemaining >= 0 ? daysRemaining : 0;
};

// Helper-Funktion zum Überprüfen, ob die Baustelle abgelaufen ist
const isConstructionExpired = (endDate) => {
    const currentDate = new Date();
    const end = new Date(endDate);
    return currentDate > end;
};

// Helper-Funktion zum Hinzufügen von Markern zur Karte mit Countdown
const addConstructionMarkersToMap = (data, icon, clusterGroup) => {
    clusterGroup.clearLayers();
    data.forEach(item => {
        // Überspringen, wenn die Baustelle abgelaufen ist
        if (isConstructionExpired(item.endDate)) return;

        const daysRemaining = calculateDaysRemaining(item.endDate);

        const popupContent = `
            <b>${item.name}</b><br>
            Enddatum: ${item.endDate}<br>
            ${daysRemaining} Tage bis zum Ende
        `;

        const marker = L.marker([item.lat, item.lon], { icon })
            .bindPopup(popupContent);
        clusterGroup.addLayer(marker);
    });
    map.addLayer(clusterGroup);
};

// Helper-Funktion zum Laden und Hinzufügen von Markern
const loadMarkers = (url, icon, clusterGroup, flagObj) => {
    if (!flagObj.loaded) {
        fetchData(url, (data) => {
            addMarkersToMap(data, icon, clusterGroup);
            flagObj.loaded = true; // Aktualisiere die 'loaded'-Eigenschaft im Objekt
        });
    } else {
        map.addLayer(clusterGroup); // Wenn die Daten bereits geladen sind, füge die Gruppe direkt hinzu
    }
};

const addMarkersToMap = (data, icon, clusterGroup) => {
    clusterGroup.clearLayers();
    data.forEach(item => {
        const marker = L.marker([item.lat, item.lon], { icon })
            .bindPopup(`<b>${item.name}</b>`);
        clusterGroup.addLayer(marker);
    });
    map.addLayer(clusterGroup);
};

/************************************************************************************************** */
/************************************Icon / Checkbox*********************************************** */
// Icon-Einstellungen-Einstellungen
const iconOptions = (url) => ({
    iconUrl: url,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: 'custom-icon' // Füge eine benutzerdefinierte Klasse hinzu
});

// Definieren von Icon und Cluster-Gruppen
const icons = {
    hospital: L.icon(iconOptions('/images/hospital-icon.png')),
    church: L.icon(iconOptions('/images/church-icon.png')),
    construction: L.icon(iconOptions('/images/construction-icon.png')),
    militaryAirport: L.icon(iconOptions('/images/military-icon.png')), // Neues Icon für Militärflugplätze
    airport: L.icon(iconOptions('/images/airport-icon.png')) // Neues Icon für Flughäfen


};

const clusterGroups = {
    hospital: L.markerClusterGroup(),
    church: L.markerClusterGroup(),
    construction: L.markerClusterGroup(),
    militaryAirport: L.markerClusterGroup(), // Neue Clustergruppe für Militärflugplätze
    airport: L.markerClusterGroup() // Neue Clustergruppe für Flughäfen


};

// Kontrollvariablen als Objekte für die Datenladung
let hospitalsLoaded = { loaded: false };
let churchesLoaded = { loaded: false };
let constructionsLoaded = { loaded: false };
let militaryAirportsLoaded = { loaded: false }; // Neue Kontrollvariable für Militärflugplätze
let airportsLoaded = { loaded: false }; // Neue Kontrollvariable für Flughäfen

// Noise-Layers für alle Kategorien initialisieren
const noiseLayers = {
    hospital: [],
    church: [],
    construction: [],
    militaryAirport: [],
    airport: []
};
// Speichert die Zuordnung zwischen Marker-IDs und ihren Noise-Circles
const markerNoiseMapping = {};

// Helper-Funktion: Lärmradius mit simuliertem Farbverlauf erstellenconst createNoiseCircle 
const createNoiseCircle = (id, lat, lon, category) => {
    let steps;

    // Individuelle Radien und Farben für Kategorien
    if (category === 'hospital') {
        steps = [
            { radius: 150, color: 'darkred', opacity: 0.7 },
            { radius: 300, color: 'red', opacity: 0.6 },
            { radius: 400, color: 'orange', opacity: 0.5 }
        ];
    } else if (category === 'church') {
        steps = [
            { radius: 100, color: 'blue', opacity: 0.7 },
            { radius: 200, color: 'lightblue', opacity: 0.6 },
            { radius: 300, color: 'skyblue', opacity: 0.5 }
        ];
    } else if (category === 'construction') {
        steps = [
            { radius: 50, color: 'brown', opacity: 0.6 },
            { radius: 100, color: 'sienna', opacity: 0.5 },
            { radius: 150, color: 'goldenrod', opacity: 0.4 }
        ];
    } else if (category === 'militaryAirport') {
        steps = [
            { radius: 300, color: 'green', opacity: 0.6 },
            { radius: 500, color: 'lime', opacity: 0.5 },
            { radius: 700, color: 'lightgreen', opacity: 0.4 }
        ];
    } else if (category === 'airport') {
        steps = [
            { radius: 500, color: 'purple', opacity: 0.7 },
            { radius: 800, color: 'violet', opacity: 0.6 },
            { radius: 1000, color: 'lavender', opacity: 0.5 }
        ];
    } else {
        // Standardradien für andere Kategorien
        steps = [
            { radius: 100, color: 'darkred', opacity: 0.7 },
            { radius: 200, color: 'red', opacity: 0.6 },
            { radius: 300, color: 'orange', opacity: 0.5 }
        ];
    }

    // Erstelle Noise-Circles basierend auf den definierten Schritten
    const circles = steps.map(step =>
        L.circle([lat, lon], {
            radius: step.radius,     // Radius in Metern
            color: step.color,       // Farbe der Kontur
            fillColor: step.color,   // Füllfarbe
            fillOpacity: step.opacity, // Transparenz
            weight: 0                // Kein Rand
        })
    );

    // Noise-Circles speichern
    markerNoiseMapping[id] = { category, circles };
    circles.forEach(circle => circle.addTo(map));
};

    
// Entferne Noise-Circles von der Karte
function removeNoiseCircle(id) {
    if (markerNoiseMapping[id]) {
        markerNoiseMapping[id].circles.forEach(circle => {
            map.removeLayer(circle);
        });
        delete markerNoiseMapping[id]; // Entferne die Zuordnung aus dem Mapping
    }
}   

/************************************ Eventlistener *********************************************** */


// Eventlistener für die Spitäler-Checkbox
$('#filterHospitals').change(() => {
    if ($('#filterHospitals').is(':checked')) {
        loadMarkers('/api/hospitals.json', icons.hospital, clusterGroups.hospital, hospitalsLoaded);

        // Füge Lärmradius mit Farbverlauf hinzu
        fetchData('/api/hospitals.json', (data) => {
            data.forEach(item => {
                createNoiseCircle(`hospital-${item.id}`, item.lat, item.lon, 'hospital'); // ID und Kategorie übergeben
            });
        });
    } else {
        // Entferne Marker und Lärmradius
        map.removeLayer(clusterGroups.hospital);
        Object.keys(markerNoiseMapping).forEach(id => {
            if (markerNoiseMapping[id].category === 'hospital') {
                removeNoiseCircle(id);
            }
        });
    }
});

// Eventlistener für die Kirchen-Checkbox
$('#filterChurches').change(() => {
    if ($('#filterChurches').is(':checked')) {
        loadMarkers('/api/churches', icons.church, clusterGroups.church, churchesLoaded);

        // Füge Lärmradius mit Farbverlauf hinzu
        fetchData('/api/churches', (data) => {
            data.forEach(item => {
                createNoiseCircle(`church-${item.id}`, item.lat, item.lon, 'church'); // ID und Kategorie übergeben
            });
        });
    } else {
        // Entferne Marker und Lärmradius
        map.removeLayer(clusterGroups.church);
        Object.keys(markerNoiseMapping).forEach(id => {
            if (markerNoiseMapping[id].category === 'church') {
                removeNoiseCircle(id);
            }
        });
    }
});

// Eventlistener für Baustellen
$('#filterConstruction').change(() => {
    if ($('#filterConstruction').is(':checked')) {
        fetchData('/api/construction', (data) => {
            addConstructionMarkersToMap(data, icons.construction, clusterGroups.construction);

            // Füge Lärmradius mit Farbverlauf hinzu
            data.forEach(item => {
                createNoiseCircle(`construction-${item.id}`, item.lat, item.lon, 'construction'); // ID und Kategorie übergeben
            });
        });
    } else {
        // Entferne Marker und Lärmradius
        map.removeLayer(clusterGroups.construction);
        Object.keys(markerNoiseMapping).forEach(id => {
            if (markerNoiseMapping[id].category === 'construction') {
                removeNoiseCircle(id);
            }
        });
    }
});

// Eventlistener für Militärflugplätze
$('#filterMilitaryAirports').change(() => {
    if ($('#filterMilitaryAirports').is(':checked')) {
        loadMarkers('/api/military_airports', icons.militaryAirport, clusterGroups.militaryAirport, militaryAirportsLoaded);

        // Füge Lärmradius mit Farbverlauf hinzu
        fetchData('/api/military_airports', (data) => {
            data.forEach(item => {
                createNoiseCircle(`militaryAirport-${item.id}`, item.lat, item.lon, 'militaryAirport'); // ID und Kategorie übergeben
            });
        });
    } else {
        // Entferne Marker und Lärmradius
        map.removeLayer(clusterGroups.militaryAirport);
        Object.keys(markerNoiseMapping).forEach(id => {
            if (markerNoiseMapping[id].category === 'militaryAirport') {
                removeNoiseCircle(id);
            }
        });
    }
});

// Eventlistener für Flughäfen
$('#filterAirports').change(() => {
    if ($('#filterAirports').is(':checked')) {
        loadMarkers('/api/airports', icons.airport, clusterGroups.airport, airportsLoaded);

        // Füge Lärmradius mit Farbverlauf hinzu
        fetchData('/api/airports', (data) => {
            data.forEach(item => {
                createNoiseCircle(`airport-${item.id}`, item.lat, item.lon, 'airport'); // ID und Kategorie übergeben
            });
        });
    } else {
        // Entferne Marker und Lärmradius
        map.removeLayer(clusterGroups.airport);
        Object.keys(markerNoiseMapping).forEach(id => {
            if (markerNoiseMapping[id].category === 'airport') {
                removeNoiseCircle(id);
            }
        });
    }
});


/************************************************************************************************** */
/***********************************************Suche*************************************************** */
// Geocoding über den "Suche"-Button
$('#searchForm').submit((e) => {
    e.preventDefault();
    const address = $('#addressInput').val().trim();
    if (address) {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=ch&q=${encodeURIComponent(address)}&limit=1`)
            .then(response => response.json())
            .then(data => {
                if (data.length) {
                    const [lat, lon] = [data[0].lat, data[0].lon];
                    if (marker) map.removeLayer(marker);
                    marker = L.marker([lat, lon]).addTo(map)
                        .bindPopup(`Gefundene Adresse: ${data[0].display_name}`)
                        .openPopup();
                    map.setView([lat, lon], Math.min(map.getZoom() + 10, 19));
                } else {
                    alert('Adresse nicht gefunden.');
                }
            })
            .catch(error => {
                console.error('Fehler bei der Suche:', error);
                alert('Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
            });
    }
});
/************************************************************************************************** */
/**********************************************Adressvorschläge**************************************************** */
// Adressvorschläge bei Eingabe anzeigen
$('#addressInput').on('input', function () {
    var address = $(this).val().trim();

    if (address.length > 2) {  // Mindestens 3 Zeichen, bevor die Suche ausgelöst wird
        if (searchCache[address]) {
            // Wenn die Anfrage bereits im Cache ist, benutze die zwischengespeicherten Daten
            displaySuggestions(searchCache[address]);
        } else {
            // Sonst mache eine neue Anfrage
            $.getJSON(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=ch&q=${encodeURIComponent(address)}&limit=5`)
                .done(function (data) {
                    searchCache[address] = data.length ? data : [];  // Speichere die Daten im Cache, auch leere Ergebnisse
                    displaySuggestions(data);
                })
                .fail(function () {
                    $('#suggestions').empty().append(`<li class="list-group-item">Fehler bei der Suche</li>`);
                });
        }
    } else {
        $('#suggestions').empty();  // Wenn weniger als 3 Zeichen, lösche Vorschläge
    }
});

// Funktion zur Anzeige der Vorschläge
function displaySuggestions(data) {
    $('#suggestions').empty();
    if (data.length) {
        data.forEach(function(item) {
            $('#suggestions').append(`
                <li class="list-group-item" data-lat="${item.lat}" data-lon="${item.lon}">
                    ${item.display_name}
                </li>
            `);
        });
    } else {
        $('#suggestions').append(`<li class="list-group-item">Keine Ergebnisse gefunden</li>`);
    }
}

// Marker auf der Karte setzen, wenn ein Vorschlag ausgewählt wird
$(document).on('click', '#suggestions li', function() {
    var lat = $(this).data('lat');
    var lon = $(this).data('lon');
    var address = $(this).text();

    if (marker) {
        map.removeLayer(marker); // Entferne den alten Marker, falls vorhanden
    }

    // Setze den Marker und zeige die Adresse im Popup an
    marker = L.marker([lat, lon]).addTo(map)
        .bindPopup(`Gefundene Adresse: ${address}`)
        .openPopup();

    // Karte auf die Koordinaten zentrieren
    map.setView([lat, lon], Math.min(map.getZoom() + 10, 19));

    // Leere die Vorschlagsliste
    $('#suggestions').empty();
});
/************************************************************************************************** */
/***************************************Localisierung*********************************************************** */
// Geolocation-Funktion zur Ermittlung des aktuellen Standorts
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation wird von diesem Browser nicht unterstützt.");
    }
}

// Funktion zur Anzeige der aktuellen Position oder zum Entfernen des Markers
function toggleLocation() {
    if (marker && map.hasLayer(marker)) {
        // Wenn der Marker vorhanden ist und auf der Karte liegt, entferne ihn
        map.removeLayer(marker);
        marker = null; // Setze die Marker-Variable auf null
    } else {
        // Ansonsten Standort abrufen und anzeigen
        getLocation();
    }
}


// Funktion zur Anzeige der aktuellen Position auf der Karte
function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

        // Entferne vorherige Standortmarker, falls vorhanden
        if (marker) {
            map.removeLayer(marker);
        }


    // Füge einen neuen Marker an der aktuellen Position hinzu
    marker = L.marker([lat, lon]).addTo(map)
        .bindPopup("Aktueller Standort")
        .openPopup();

    // Zentriere die Karte auf die aktuelle Position
    map.setView([lat, lon], 14);
}

// Funktion zur Fehlerbehandlung bei Geolocation
function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("Benutzer hat die Standortabfrage abgelehnt.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Standortinformationen sind nicht verfügbar.");
            break;
        case error.TIMEOUT:
            alert("Die Anfrage zur Standortabfrage ist abgelaufen.");
            break;
        case error.UNKNOWN_ERROR:
            alert("Ein unbekannter Fehler ist aufgetreten.");
            break;
    }
}

// Event-Listener für den Standort-Button
document.getElementById('locationButton').addEventListener('click', toggleLocation);


/************************************************************************************************** */
/***************************************Info-Buttom*********************************************************** */
// Event-Listener für die Info-Buttons
document.querySelectorAll('.info-btn').forEach(button => {
    button.addEventListener('click', function(event) {
        event.preventDefault(); // Verhindere das Standard-Button-Verhalten

        // Überprüfen, ob das Popup bereits existiert und entfernt werden soll
        let existingPopup = document.querySelector('.info-popup');
        if (existingPopup) {
            existingPopup.remove();
            return; // Popup entfernt, also hier aufhören
        }

        // Erstelle ein neues Info-Fenster
        const infoText = this.getAttribute('data-info');
        let popup = document.createElement('div');
        popup.classList.add('info-popup');

        // Füge den Info-Text und den Schließen-Button hinzu
        popup.innerHTML = `
            <button class="close-popup">&times;</button>
            <div class="info-content b-1">
                <p>${infoText}</p>
            </div>
        `;

        // Füge das Info-Fenster dem Offcanvas-Body hinzu
        const offcanvasBody = document.querySelector('.offcanvas-body'); // Offcanvas-Container
        offcanvasBody.appendChild(popup);

        // Positioniere das Info-Fenster direkt neben dem Button innerhalb des Offcanvas-Containers
        const buttonRect = this.getBoundingClientRect(); // Position des Buttons
        const containerRect = offcanvasBody.getBoundingClientRect(); // Begrenze das Popup auf den Offcanvas-Body

        // Berechne die exakte Position relativ zum Button
        popup.style.position = 'absolute';
        popup.style.top = `${buttonRect.top - containerRect.top}px`;  // Exakte Höhe wie der Button
        popup.style.left = `${buttonRect.right - containerRect.left + 10}px`;  // Rechts vom Button mit einem Abstand von 10px

        // Event-Listener für den Schließen-Button (das "X")
        document.querySelector('.close-popup').addEventListener('click', function() {
            popup.remove(); // Entferne das Popup, wenn auf "X" geklickt wird
        });

        // Schließe das Fenster bei einem Klick außerhalb des Popups
        document.addEventListener('click', function(event) {
            if (!popup.contains(event.target) && !button.contains(event.target)) {
                popup.remove();
            }
        }, { once: true });
    });
});

// Lädt ausstehende Lärmquellen
function loadPendingNoiseSources() {
    fetch('./api/pending.json')
        .then(response => response.json())
        .then(data => {
            console.log('Ausstehende Lärmquellen:', data);
            updateAdminDashboard(data); // Daten an eine Funktion zur Anzeige im Dashboard übergeben
        })
        .catch(error => console.error('Fehler beim Laden der Warteschlange:', error));
}

//////////////////////////Logik zum Anzeigen des Kontextmenüs//////////////////////////////
let selectedCoordinates = null;

// Entferne Eventlistener für Linksklick auf die Karte, falls vorhanden
map.off('click');

// Eventlistener für Rechtsklick auf die Karte
map.on('contextmenu', function (e) {
    // Koordinaten speichern
    selectedCoordinates = e.latlng;

    // Positioniere das Kontextmenü
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.left = `${e.originalEvent.pageX}px`;
    contextMenu.style.top = `${e.originalEvent.pageY}px`;
    contextMenu.classList.remove('d-none');

    // Aktualisiere den Text für Koordinatenanzeige im Menü
    const coordinateText = `Koordinaten: ${selectedCoordinates.lat.toFixed(5)}, ${selectedCoordinates.lng.toFixed(5)}`;
    document.getElementById('showCoordinates').textContent = coordinateText;
});

// Kontextmenü ausblenden bei Klick außerhalb
document.addEventListener('click', (e) => {
    const contextMenu = document.getElementById('contextMenu');
    if (!contextMenu.contains(e.target)) {
        contextMenu.classList.add('d-none');
    }
});

// Aktion: Lärmquelle hinzufügen
document.getElementById('addNoiseSource').addEventListener('click', () => {
    if (selectedCoordinates) {
        const { lat, lng } = selectedCoordinates;
        document.getElementById('selectedCoordinates').textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        const categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));
        categoryModal.show();
    } else {
        alert('Keine Koordinaten ausgewählt!');
    }
});

// Aktion: Korrektur
document.getElementById('correctionOption').addEventListener('click', () => {
    alert('Funktion "Korrektur" wird implementiert.');
    // Hier kannst du die Korrektur-Logik implementieren
});

// Aktion: Koordinaten anzeigen und kopieren
document.getElementById('showCoordinates').addEventListener('click', () => {
    if (selectedCoordinates) {
        const { lat, lng } = selectedCoordinates;
        const coordinateText = `Latitude: ${lat.toFixed(5)}, Longitude: ${lng.toFixed(5)}`;

        // Kopiere die Koordinaten in die Zwischenablage
        navigator.clipboard.writeText(coordinateText).then(() => {
            alert(`Koordinaten kopiert: ${coordinateText}`);
        }).catch(err => {
            console.error('Fehler beim Kopieren in die Zwischenablage:', err);
            alert('Fehler beim Kopieren der Koordinaten.');
        });
    } else {
        alert('Keine Koordinaten ausgewählt!');
    }
});
///////////////////////button Lärmquelle////////////////////



// Eventlistener für den Button zum Öffnen des Modals oder zur Aktivierung des Kartenclicks
document.getElementById('openModalButton').addEventListener('click', () => {
    if (!selectedCoordinates) {
        alert('Bitte klicken Sie auf die Karte, um eine Position auszuwählen.');
        enableMapClickForModal(); // Aktiviert das Kartenklicken, falls noch keine Koordinaten ausgewählt wurden
    } else {
        openCategoryModal(selectedCoordinates); // Öffnet das Modal, wenn Koordinaten bereits vorhanden sind
    }
});

// Aktiviert das Klicken auf die Karte und öffnet direkt das Modal
function enableMapClickForModal() {
    // Entferne vorherige Listener, um Mehrfachbindungen zu vermeiden
    map.off('click');

    // Füge einen neuen Listener hinzu
    map.on('click', function onMapClick(e) {
        // Speichere die Koordinaten
        selectedCoordinates = e.latlng;

        // Öffne das Modal mit den ausgewählten Koordinaten
        openCategoryModal(selectedCoordinates);

        // Entferne den Eventlistener, wenn die Koordinaten ausgewählt wurden
        map.off('click', onMapClick);
    });
}

// Öffnet das Modal mit den ausgewählten Koordinaten
function openCategoryModal(coordinates) {
    const { lat, lng } = coordinates;

    // Aktualisiere die Koordinatenanzeige im Modal
    document.getElementById('selectedCoordinates').textContent = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    // Zeige das Modal an
    const categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));
    categoryModal.show();

    // Füge Eventlistener hinzu, um `selectedCoordinates` zurückzusetzen, wenn das Modal geschlossen wird
    const modalElement = document.getElementById('categoryModal');
    modalElement.addEventListener('hidden.bs.modal', () => {
        selectedCoordinates = null; // Zurücksetzen der Koordinaten
    });
}
