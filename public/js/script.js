/************************************************************************************ */
/******************************************** Main**************************************** */
// Initialisiere die Variable 'marker' global, damit sie in allen Funktionen verwendet werden kann
var marker;
var searchCache = {};  // Cache für Suchanfragen

// Initialisiere die Karte
const map = L.map('map').setView([46.8182, 8.2275], 8);

// Initialisierung der Kartenansichten
var standardLayer = L.tileLayer('https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg', {
    minZoom: 9,
    maxZoom: 19,
    updateWhenIdle: true, // Tiles werden nur dann aktualisiert, wenn die Karte ruhig ist.
    useCache: true, // Caching aktivieren (erfordert ein entsprechendes Plugin)
    subdomains: '123',
    attribution: '&copy; <a href="https://www.swisstopo.admin.ch/de/home.html">swisstopo</a>'
});
// Swisstopo Satellitenansicht
var satelliteLayer = L.tileLayer('https://wmts{s}.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg', {
    maxZoom: 19,
    minZoom: 9,
    updateWhenIdle: true, // Tiles werden nur dann aktualisiert, wenn die Karte ruhig ist.
    useCache: true, // Caching aktivieren (erfordert ein entsprechendes Plugin)
    subdomains: '123',
    attribution: '&copy; <a href="https://www.swisstopo.admin.ch/de/home.html">swisstopo</a>'
});

// Standard-Karte beim Laden hinzufügen
map.addLayer(standardLayer);

// Event-Listener für das Wechseln der Kartenansicht
document.getElementById('standardView').addEventListener('click', function(e) {
    e.preventDefault();
    map.removeLayer(satelliteLayer);
    map.addLayer(standardLayer);
    document.querySelectorAll('.dropdown-item').forEach(function(item) {
        item.classList.remove('active');
    });
    this.classList.add('active');
});

document.getElementById('satelliteView').addEventListener('click', function(e) {
    e.preventDefault();
    map.removeLayer(standardLayer);
    map.addLayer(satelliteLayer);
    document.querySelectorAll('.dropdown-item').forEach(function(item) {
        item.classList.remove('active');
    });
    this.classList.add('active');
});

// Funktion zum Aktualisieren des aktiven Buttons
function updateActiveButton(activeButton) {
    document.querySelectorAll('.map-view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeButton.classList.add('active');
}

// Hinweis anzeigen beim ersten Wechsel
if (!localStorage.getItem('viewChangeHintShown')) {
    alert('Wechseln Sie zwischen den Kartenansichten mit den Optionen oben.');
    localStorage.setItem('viewChangeHintShown', 'true');
}
/************************************************************************************ */
/******************************************** Strassen Lärem**************************************** */
// Erfasse den Schieberegler, die Checkbox und die Layer für Tag/Nacht-Lärm
var dayNightToggle = document.querySelector('.day-night-toggle'); // Der Schieberegler für Tag/Nacht
var dayNightToggle = document.querySelector('.day-night-toggle'); // Der Schieberegler für Tag/Nacht
var noiseCheckbox = document.getElementById('filterNoise'); // Die Checkbox für Straßenlärm

var dayNoiseLayer = L.tileLayer('https://wmts{s}.geo.admin.ch/1.0.0/ch.bafu.laerm-strassenlaerm_tag/default/current/3857/{z}/{x}/{y}.png', {
    minZoom: 12,
    maxZoom: 19,
    subdomains: '1234',
    opacity: 0.7,
    attribution: '&copy; <a href="https://www.bafu.admin.ch/bafu/de/home/themen/laerm.html">BAFU</a>'
});

var nightNoiseLayer = L.tileLayer('https://wmts{s}.geo.admin.ch/1.0.0/ch.bafu.laerm-strassenlaerm_nacht/default/current/3857/{z}/{x}/{y}.png', {
    minZoom: 12,
    maxZoom: 19,
    subdomains: '1234',
    opacity: 0.7,
    attribution: '&copy; <a href="https://www.bafu.admin.ch/bafu/de/home/themen/laerm.html">BAFU</a>'
});



// Initial: Schieberegler und Lärmlayer verstecken
dayNightToggle.style.display = 'none';
dayNoiseLayer.remove();
nightNoiseLayer.remove();

// Event-Listener für die Straßenlärm-Checkbox
noiseCheckbox.addEventListener('change', function() {
    if (this.checked) {
        // Wenn die Checkbox für Straßenlärm aktiviert ist, den Schieberegler anzeigen
        dayNightToggle.style.display = 'block';

        // Wenn der Schieberegler auf "Nacht" steht, den Nacht-Layer hinzufügen
        if (document.getElementById('dayNightToggle').checked) {
            map.addLayer(nightNoiseLayer);
            dayNightLabel.textContent = 'Nacht'; // Zeige "Nacht" als Text an
        } else {
            // Ansonsten den Tag-Layer hinzufügen
            map.addLayer(dayNoiseLayer);
            dayNightLabel.textContent = 'Tag'; // Zeige "Tag" als Text an
        }
    } else {
        // Wenn die Checkbox deaktiviert ist, den Schieberegler verstecken und beide Layer entfernen
        dayNightToggle.style.display = 'none';
        map.removeLayer(dayNoiseLayer);
        map.removeLayer(nightNoiseLayer);
    }
});

// Eventlistener für die Straßenlärm-Checkbox
$('#filterNoise').change(() => {
    if ($('#filterNoise').is(':checked')) {
        // Checkbox ist aktiviert, Schieberegler anzeigen und Lärm-Layer hinzufügen
        dayNightToggle.style.display = 'block';

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
        dayNightToggle.style.display = 'none';
        map.removeLayer(dayNoiseLayer);
        map.removeLayer(nightNoiseLayer);
    }
});

// Eventlistener für den Tag/Nacht-Schieberegler (Straßenlärm)
$('#dayNightToggle').change(() => {
    if ($('#dayNightToggle').is(':checked')) {
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
    minZoom: 12,
    maxZoom: 19,
    subdomains: '1234',
    opacity: 0.7,
    attribution: '&copy; <a href="https://www.bafu.admin.ch/bafu/de/home/themen/laerm.html">BAFU</a>'
});

var trainNightNoiseLayer = L.tileLayer('https://wmts{s}.geo.admin.ch/1.0.0/ch.bafu.laerm-bahnlaerm_nacht/default/current/3857/{z}/{x}/{y}.png', {
    minZoom: 12,
    maxZoom: 19,
    subdomains: '1234',
    opacity: 0.7,
    attribution: '&copy; <a href="https://www.bafu.admin.ch/bafu/de/home/themen/laerm.html">BAFU</a>'
});

// Initial: Schieberegler und Zuglärmlayer verstecken
trainDayNightToggle.style.display = 'none';
trainDayNoiseLayer.remove();
trainNightNoiseLayer.remove();

// Event-Listener für die Zuglärm-Checkbox
trainNoiseCheckbox.addEventListener('change', function() {
    if (this.checked) {
        // Wenn die Checkbox für Zuglärm aktiviert ist, den Schieberegler anzeigen
        trainDayNightToggle.style.display = 'block';

        // Wenn der Schieberegler auf "Nacht" steht, den Nacht-Zuglärm-Layer hinzufügen
        if (document.getElementById('trainDayNightToggle').checked) {
            map.addLayer(trainNightNoiseLayer);
            trainDayNightLabel.textContent = 'Nacht'; // Zeige "Nacht" an
        } else {
            // Ansonsten den Tag-Zuglärm-Layer hinzufügen
            map.addLayer(trainDayNoiseLayer);
            trainDayNightLabel.textContent = 'Tag'; // Zeige "Tag" an
        }
    } else {
        // Wenn die Checkbox deaktiviert ist, den Schieberegler verstecken und beide Layer entfernen
        trainDayNightToggle.style.display = 'none';
        map.removeLayer(trainDayNoiseLayer);
        map.removeLayer(trainNightNoiseLayer);
    }
});

// Eventlistener für den Schieberegler Tag/Nacht (Zuglärm)
$('#trainDayNightToggle').change(() => {
    if ($('#trainDayNightToggle').is(':checked')) {
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

// Eventlistener für die Zuglärm-Checkbox
$('#filterTrainNoise').change(() => {
    if (map.hasLayer(trainDayNoiseLayer) || map.hasLayer(trainNightNoiseLayer)) {
        // Wenn einer der Zuglärm-Layer bereits vorhanden ist, entferne sie
        map.removeLayer(trainDayNoiseLayer);
        map.removeLayer(trainNightNoiseLayer);
        trainDayNightToggle.style.display = 'none'; // Schieberegler verstecken
    } else {
        // Schieberegler anzeigen
        trainDayNightToggle.style.display = 'block';

        // Wenn der Schieberegler auf "Nacht" steht, den Nacht-Layer hinzufügen
        if ($('#trainDayNightToggle').is(':checked')) {
            map.addLayer(trainNightNoiseLayer);
            trainDayNightLabel.textContent = 'Nacht'; // Zeige "Nacht" an
        } else {
            // Ansonsten den Tag-Layer hinzufügen
            map.addLayer(trainDayNoiseLayer);
            trainDayNightLabel.textContent = 'Tag'; // Zeige "Tag" an
        }
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
// Popup bei Klick auf die Karte anzeigen
map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    L.popup()
        .setLatLng(e.latlng)
        .setContent(`Koordinaten: <br> Latitude: ${lat.toFixed(5)} <br> Longitude: ${lng.toFixed(5)}`)
        .openOn(map);
});
/************************************************************************************************** */
/**************************************************Helper-Funktion************************************************ */
// Helper-Funktion zum Laden von Daten
const fetchData = (url, callback) => {
    $.getJSON(url, callback).fail(() => console.error(`Fehler beim Laden von ${url}`));
};

// Helper-Funktion zum Hinzufügen von Markern zur Karte
const addMarkersToMap = (data, icon, clusterGroup) => {
    clusterGroup.clearLayers();
    data.forEach(item => {
        const marker = L.marker([item.lat, item.lon], { icon })
            .bindPopup(`<b>${item.name}</b>`);
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
/************************************************************************************************** */
/************************************Icon / Checkbox*********************************************** */
// Icon-Einstellungen-Einstellungen
const iconOptions = (url) => ({
    iconUrl: url,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Definieren von Icon und Cluster-Gruppen
const icons = {
    hospital: L.icon(iconOptions('/images/hospital-icon.png')),
    playground: L.icon(iconOptions('/images/playground-icon.png')),
    school: L.icon(iconOptions('/images/school-icon.png')),
    church: L.icon(iconOptions('/images/church-icon.png')),
    construction: L.icon(iconOptions('/images/construction-icon.png'))
};

const clusterGroups = {
    hospital: L.markerClusterGroup(),
    playground: L.markerClusterGroup(),
    school: L.markerClusterGroup(),
    church: L.markerClusterGroup(),
    construction: L.markerClusterGroup()
};

// Kontrollvariablen als Objekte für die Datenladung
let hospitalsLoaded = { loaded: false };
let playgroundsLoaded = { loaded: false };
let schoolsLoaded = { loaded: false };
let churchesLoaded = { loaded: false };
let constructionsLoaded = { loaded: false };



// Eventlistener für die Spitäler-Checkbox
$('#filterHospitals').change(() => {
    if ($('#filterHospitals').is(':checked')) {
        loadMarkers('/api/spitaldaten', icons.hospital, clusterGroups.hospital, hospitalsLoaded);
    } else {
        map.removeLayer(clusterGroups.hospital);
    }
});



// Eventlistener für die Schul-Checkbox
$('#filterSchools').change(() => {
    if ($('#filterSchools').is(':checked')) {
        loadMarkers('/api/schools', icons.school, clusterGroups.school, schoolsLoaded);
    } else {
        map.removeLayer(clusterGroups.school);
    }
});

// Eventlistener für die Zuglärm-Checkbox
$('#filterTrainNoise').change(() => {
    if (map.hasLayer(trainDayNoiseLayer) || map.hasLayer(trainNightNoiseLayer)) {
        // Wenn einer der Zuglärm-Layer bereits vorhanden ist, entferne sie
        map.removeLayer(trainDayNoiseLayer);
        map.removeLayer(trainNightNoiseLayer);
        trainDayNightToggle.style.display = 'none'; // Schieberegler verstecken
    } else {
        // Schieberegler anzeigen
        trainDayNightToggle.style.display = 'block';

        // Wenn der Schieberegler auf "Nacht" steht, den Nacht-Layer hinzufügen
        if ($('#trainDayNightToggle').is(':checked')) {
            map.addLayer(trainNightNoiseLayer);
            trainDayNightLabel.textContent = 'Nacht'; // Zeige "Nacht" an
        } else {
            // Ansonsten den Tag-Layer hinzufügen
            map.addLayer(trainDayNoiseLayer);
            trainDayNightLabel.textContent = 'Tag'; // Zeige "Tag" an
        }
    }
});

// Eventlistener für die Kirchen-Checkbox
$('#filterChurches').change(() => {
    if ($('#filterChurches').is(':checked')) {
        loadMarkers('/api/churches', icons.church, clusterGroups.church, churchesLoaded);
    } else {
        map.removeLayer(clusterGroups.church);
    }
});

// Eventlistener für die Baustellen-Checkbox
$('#filterConstruction').change(() => {
    if ($('#filterConstruction').is(':checked')) {
        loadMarkers('/api/construction', icons.construction, clusterGroups.construction, constructionsLoaded);
    } else {
        map.removeLayer(clusterGroups.construction);
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
document.getElementById('locationButton').addEventListener('click', function() {
    getLocation(); // Starte die Standortabfrage
});
