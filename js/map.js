/* ===== map.js — Leaflet Map with Circle Markers ===== */

const MapModule = (() => {
    let map = null;
    let markersLayer = null;

    const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

    function init(containerId) {
        map = L.map(containerId, {
            center: [20, 0],
            zoom: 2,
            minZoom: 1.5,
            maxZoom: 6,
            zoomControl: true,
            scrollWheelZoom: true,
            attributionControl: false
        });

        L.tileLayer(TILE_URL, {
            attribution: TILE_ATTR,
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // Attribution in bottom-right (smaller)
        L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

        markersLayer = L.layerGroup().addTo(map);

        // Fix Leaflet rendering in hidden containers
        setTimeout(() => map.invalidateSize(), 300);
    }

    function getColor(cases) {
        if (cases > 10000000) return '#EF4444';   // High — red
        if (cases > 1000000) return '#F59E0B';     // Medium — orange
        return '#10B981';                           // Low — green
    }

    function getRadius(cases) {
        if (cases > 50000000) return 22;
        if (cases > 20000000) return 16;
        if (cases > 10000000) return 13;
        if (cases > 5000000) return 10;
        if (cases > 1000000) return 7;
        return 5;
    }

    function formatNum(n) {
        if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
        if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
        if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
        return n.toLocaleString();
    }

    function update(data) {
        if (!markersLayer) return;
        markersLayer.clearLayers();

        data.forEach(row => {
            if (!row._lat || !row._lng) return;

            const cases = row.Total_Cases || 0;
            const color = getColor(cases);
            const radius = getRadius(cases);

            const circle = L.circleMarker([row._lat, row._lng], {
                radius: radius,
                fillColor: color,
                color: color,
                weight: 1.5,
                opacity: 0.9,
                fillOpacity: 0.55
            });

            circle.bindPopup(`
                <strong>${row.Country}</strong><br>
                <span style="color:#64748B">Cases:</span> <strong>${formatNum(cases)}</strong><br>
                <span style="color:#64748B">Deaths:</span> <strong>${formatNum(row.Total_Deaths || 0)}</strong><br>
                <span style="color:#64748B">Recovered:</span> <strong>${formatNum(row.Recovered || 0)}</strong><br>
                <span style="color:#64748B">Vaccination:</span> <strong>${row.Vaccination_Rate || 0}%</strong>
            `, { closeButton: false });

            circle.on('mouseover', function () { this.openPopup(); });
            circle.on('mouseout', function () { this.closePopup(); });

            markersLayer.addLayer(circle);
        });

        // Re-fit bounds if we have markers
        if (data.length > 0 && map) {
            setTimeout(() => map.invalidateSize(), 100);
        }
    }

    function resize() {
        if (map) setTimeout(() => map.invalidateSize(), 200);
    }

    return { init, update, resize };
})();
