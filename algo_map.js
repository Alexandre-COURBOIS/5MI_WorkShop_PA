mapboxgl.accessToken = 'pk.eyJ1Ijoid2ViYXBzeSIsImEiOiJjazhlYXk1ejkxNGFpM2dsdjJkaDd2b2RmIn0.pWabX6z0Us-G8OiF9DhuNA';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [1.08333, 49.433331],
    zoom: 10
});

map.on('load', function () {
    fetch('http://127.0.0.1:5000/run-script', {method: 'GET',})
        .then(response => response.json())
        .then(data => {

            // Ajout des points sur la carte
            data.order.forEach((coord, index) => {
                let el = document.createElement('div');
                el.className = 'marker';
                el.innerHTML = index;

                const marker = new mapboxgl.Marker(el)
                    .setLngLat(coord)
                    .addTo(map);
            });
        });
});

