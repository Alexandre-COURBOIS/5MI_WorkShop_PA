from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd

from external_request import xlsx_to_json, get_patients_coordinates
from algorithm import resolve_tsp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "HEAD", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"]}})

@app.route('/run-script', methods=['GET'])
def run_script():
    file_path = 'JeuDonneesWorkshop23.xlsx'
    patients_data = xlsx_to_json(file_path)
    patients_with_coords = get_patients_coordinates(patients_data)
    ordered_indices = resolve_tsp(patients_with_coords)

    ordered_coordinates = [patients_with_coords[i]['coords'] for i in ordered_indices]
    ordered_patients = [patients_with_coords[i]['patient'] for i in ordered_indices]

    for patient in ordered_patients:
        for key, value in patient.items():
            if pd.isna(value):
                patient[key] = None

    print(ordered_coordinates)
    print(ordered_patients)
    return jsonify({"order": ordered_coordinates, "patients": ordered_patients})

if __name__ == "__main__":
    app.run(port=5000)
