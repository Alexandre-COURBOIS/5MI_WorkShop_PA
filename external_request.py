import requests
import pandas as pd
MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoid2ViYXBzeSIsImEiOiJjazhlYXk1ejkxNGFpM2dsdjJkaDd2b2RmIn0.pWabX6z0Us-G8OiF9DhuNA'

def xlsx_to_json(file_path):
    df = pd.read_excel(file_path, engine='openpyxl')
    return df.to_dict(orient="records")

def get_patients_coordinates(patients):
    patients_with_coords = []

    for patient in patients:
        address = patient.get('Adresse')
        if address:
            response = requests.get(f"https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json", params={"access_token": MAPBOX_ACCESS_TOKEN})
            data = response.json()
            if 'features' in data and data['features']:
                coords = data['features'][0]['geometry']['coordinates']
                patients_with_coords.append({"patient": patient, "coords": coords})

    return patients_with_coords

def get_route_between_points(start_coords, end_coords, access_token):
    url = f"https://api.mapbox.com/directions/v5/mapbox/driving/{start_coords[0]},{start_coords[1]};{end_coords[0]},{end_coords[1]}.json"
    response = requests.get(url, params={"access_token": access_token, "geometries": "geojson", "steps": "false", "overview": "full"})
    data = response.json()
    if 'routes' in data and data['routes']:
        return data['routes'][0]['geometry']['coordinates']
    return []

def get_full_route(order, patients_with_coords):
    full_route = []

    for i in range(len(order) - 1):
        route_segment = get_route_between_points(patients_with_coords[order[i]]['coords'], patients_with_coords[order[i + 1]]['coords'], MAPBOX_ACCESS_TOKEN)
        full_route.extend(route_segment)

    if order:
        route_segment = get_route_between_points(patients_with_coords[order[-1]]['coords'], patients_with_coords[order[0]]['coords'], MAPBOX_ACCESS_TOKEN)
        full_route.extend(route_segment)

    return full_route

