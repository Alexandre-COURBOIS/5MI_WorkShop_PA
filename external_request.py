import requests
import pandas as pd

def xlsx_to_json(file_path):
    df = pd.read_excel(file_path, engine='openpyxl')
    return df.to_dict(orient="records")

def get_patients_coordinates(patients):
    patients_with_coords = []
    MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoid2ViYXBzeSIsImEiOiJjazhlYXk1ejkxNGFpM2dsdjJkaDd2b2RmIn0.pWabX6z0Us-G8OiF9DhuNA'

    for patient in patients:
        address = patient.get('Adresse')
        if address:
            response = requests.get(f"https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json", params={"access_token": MAPBOX_ACCESS_TOKEN})
            data = response.json()
            if 'features' in data and data['features']:
                coords = data['features'][0]['geometry']['coordinates']
                patients_with_coords.append({"patient": patient, "coords": coords})

    return patients_with_coords
