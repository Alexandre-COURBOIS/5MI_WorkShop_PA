mapboxgl.accessToken = 'pk.eyJ1Ijoid2ViYXBzeSIsImEiOiJjazhlYXk1ejkxNGFpM2dsdjJkaDd2b2RmIn0.pWabX6z0Us-G8OiF9DhuNA';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [1.08333, 49.433331],
    zoom: 10
});

map.on('load', function () {
    fetch('http://127.0.0.1:5000/run-script', { method: 'GET', })
        .then(response => response.json())
        .then(data => {

            map.addSource('points', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': data.order.map((coord, index) => ({
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': coord
                        },
                        'properties': {
                            'address': data.patients[index].Adresse,
                            'treatmentTime': data.patients[index]["Durée des soins"],
                            'treatment': data.patients[index]["Soins"],
                            'allergy': data.patients[index]["Allergies"]
                        }
                    }))
                },
                'cluster': true,
                'clusterRadius': 50,
                'clusterMaxZoom': 14
            });

            map.addLayer({
                'id': 'unclustered-points',
                'type': 'circle',
                'source': 'points',
                'filter': ['!', ['has', 'point_count']],
                'paint': {
                    'circle-color': '#1a3f75',
                    'circle-radius': 15
                }
            });

            map.addLayer({
                'id': 'point-labels',
                'type': 'symbol',
                'source': {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': data.order.map((coord, index) => ({
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': coord
                            },
                            'properties': {
                                'index': index + 1
                            }
                        }))
                    }
                },
                'layout': {
                    'text-field': '{index}',
                    'text-size': 18,
                    'text-anchor': 'center',
                    'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
                    'icon-image': ['concat', ['to-string', ['get', 'index']], '-15'],
                    'icon-text-fit': 'both',
                    'icon-text-fit-padding': [2, 2, 2, 2]
                },
                'paint': {
                    'text-color': '#fff',
                }
            });

            map.addLayer({
                'id': 'clusters',
                'type': 'circle',
                'source': 'points',
                'filter': ['has', 'point_count'],
                'paint': {
                    'circle-color': [
                        'step',
                        ['get', 'point_count'],
                        '#51bbd6',
                        10,
                        '#f1f075',
                        30,
                        '#f28cb1'
                    ],
                    'circle-radius': [
                        'step',
                        ['get', 'point_count'],
                        20,
                        10,
                        30,
                        30,
                        40
                    ]
                }
            });

            map.addLayer({
                'id': 'cluster-count',
                'type': 'symbol',
                'source': 'points',
                'filter': ['has', 'point_count'],
                'layout': {
                    'text-field': '{point_count_abbreviated}',
                    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                    'text-size': 12
                }
            });

            map.addSource('route', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': data.road
                    }
                }
            });
            map.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#1a3f75',
                    'line-width': 4
                }
            });

            map.on('click', 'unclustered-points', function (e) {
                var coordinates = e.features[0].geometry.coordinates.slice();
                var description = `
                    <div class="popup-content-wrapper">
                        <p class="address">${e.features[0].properties.address}</p>
                        <p class="treatment">A réaliser : ${e.features[0].properties.treatment}</p>
                        <p class="treatment-time">Durée : ${e.features[0].properties.treatmentTime} minutes</p>
                        <p class="allergy">Allergie à considérer : ${e.features[0].properties.allergy == null ? "Néant" : e.features[0].properties.allergy}</p>
                    </div>
                `;

                new mapboxgl.Popup()
                    .setLngLat(coordinates)
                    .setHTML(description)
                    .addTo(map);
            });
        });
});
