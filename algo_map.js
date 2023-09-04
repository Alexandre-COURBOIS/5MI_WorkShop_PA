mapboxgl.accessToken = 'pk.eyJ1Ijoid2ViYXBzeSIsImEiOiJjazhlYXk1ejkxNGFpM2dsdjJkaDd2b2RmIn0.pWabX6z0Us-G8OiF9DhuNA';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [1.08333, 49.433331],
    zoom: 10
});

map.on('load', function () {
    getPatientsCoordinates(getFileDatasDatas()).then(coordinates => {
        fetch('http://localhost:5000/run-script', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ coordinates })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // Ajout des points sur la carte
                data.order.forEach((coord, index) => {
                    let el = document.createElement('div');
                    el.className = 'marker';
                    el.innerHTML = index;
                    new mapboxgl.Marker(el)
                        .setLngLat(coord)
                        .addTo(map);
                });

                // Ajout de la ligne
                map.addSource('route', {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': data.order
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
            });
    });
});
async function getPatientsCoordinates(patients) {
    const coordinates = [];

    for (let patient of patients) {
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(patient.adresse)}.json?access_token=${mapboxgl.accessToken}`);
        const data = await response.json();

        if (data.features && data.features.length) {
            coordinates.push(data.features[0].geometry.coordinates);
        }
    }

    return coordinates;
}

function getFileDatasDatas() {

    const patients = [
        { soins: "Elimination", disponibilite: "8h-10h", allergies: "", animaux: "", contraintes: "Soin après repas", adresse: "34 avenue Pasteur 76000 ROUEN" },
        { soins: "Piqûre", disponibilite: "6h-8h", allergies: "chat", animaux: "", contraintes: "Soin avant tout repas", adresse: "26 rue Camille Randoing 76500 ELBEUF" },
        { soins: "Elimination", disponibilite: "6h-12h", allergies: "", animaux: "chat", contraintes: "Soin après repas", adresse: "3 rue du Four 76100 ROUEN" },
        { soins: "Elimination", disponibilite: "6h-12h", allergies: "", animaux: "chat", contraintes: "Soin après repas", adresse: "7 rue Jeanne d'Arc 76000 ROUEN" },
        { soins: "Lavage", disponibilite: "6h-8h", allergies: "chien", animaux: "chat", contraintes: "Soin après repas", adresse: "1 rue du donjon 76000 ROUEN" },
        { soins: "Pansement", disponibilite: "8h-12h", allergies: "", animaux: "basse cours", contraintes: "", adresse: "135 rue du Madrillet 76800 SAINT-ETIENNE-DU-ROUVRAY" },
        { soins: "Piqûre", disponibilite: "6h-7h", allergies: "", animaux: "", contraintes: "", adresse: "56 boulevard d'Orléans 76100 ROUEN" },
        { soins: "Repas", disponibilite: "6h-8h", allergies: "", animaux: "chat et chien", contraintes: "Soin avant tout repas", adresse: "50 rue de la république 76000 ROUEN" },
        { soins: "Elimination", disponibilite: "6h-12h", allergies: "pollen", animaux: "", contraintes: "", adresse: "72 rue de Lessard 75000 ROUEN" },
        { soins: "Pansement", disponibilite: "9h-12h", allergies: "", animaux: "", contraintes: "", adresse: "47 rue d'Elboeuf 76000 ROUEN" },
        { soins: "Lavage", disponibilite: "6h-12h", allergies: "", animaux: "", contraintes: "", adresse: "9 avenue de Verdun 76190 YVETOT" },
        { soins: "Repas", disponibilite: "7h-9h", allergies: "", animaux: "chien", contraintes: "", adresse: "Place Aristide Briand 76500 ELBOEUF" },
        { soins: "Pansement", disponibilite: "9h-11h", allergies: "", animaux: "chien", contraintes: "", adresse: "42 avenue des chouquettes 76190 YVETOT" },
        { soins: "Elimination", disponibilite: "6h-12h", allergies: "", animaux: "", contraintes: "Soin après repas", adresse: "34 avenue Pasteur 76000 ROUEN" }
    ];

    return patients;

}

