// Funktion: Lädt ausstehende Lärmquellen
function loadPendingNoiseSources() {
    fetch('../api/pending.json')
        .then(response => response.json())
        .then(data => {
            console.log('Ausstehende Lärmquellen:', data);
            updateAdminDashboard(data); // Daten im Dashboard anzeigen
        })
        .catch(error => console.error('Fehler beim Laden der Warteschlange:', error));
}

// Funktion: Aktualisiert das Admin-Dashboard
function updateAdminDashboard(data) {
    const dashboardTable = document.getElementById('adminTableBody');
    if (!dashboardTable) return;

    dashboardTable.innerHTML = ''; // Vorherige Inhalte entfernen

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.lat.toFixed(5)}, ${item.lon.toFixed(5)}</td>
            <td>
                <button class="btn btn-success btn-sm approve-btn">Genehmigen</button>
                <button class="btn btn-danger btn-sm reject-btn">Ablehnen</button>
            </td>
        `;

        dashboardTable.appendChild(row);

        // Event-Listener für die Buttons hinzufügen
        const approveButton = row.querySelector('.approve-btn');
        const rejectButton = row.querySelector('.reject-btn');

        approveButton.addEventListener('click', () => approveOrReject(item.id, true));
        rejectButton.addEventListener('click', () => approveOrReject(item.id, false));
    });
}

// Funktion: Genehmigt oder lehnt eine Lärmquelle ab
function approveOrReject(id, approve) {
    fetch('/api/approve-noise-source', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, approve }),
    })
        .then(response => response.json())
        .then(result => {
            alert(result.message);
            loadPendingNoiseSources(); // Nach der Aktion: Tabelle neu laden
        })
        .catch(error => console.error('Fehler beim Verarbeiten der Aktion:', error));
}

// DOMContentLoaded-Event: Lädt die ausstehenden Lärmquellen
document.addEventListener('DOMContentLoaded', () => {
    loadPendingNoiseSources(); // Jetzt definiert und aufrufbar
});
