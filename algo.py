# server.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import math

import math

#  Calcule la distance euclidienne entre les deux points (vol d'oiseau)
def distance(p1, p2):
    return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)

# Retourne la distance totale du parcours à réaliser
def total_distance(points, order):
    return sum(distance(points[order[i]], points[order[i + 1]]) for i in range(len(order) - 1))

# Commence par le premier point, et à chaque étape sélectionne le point le plus prôche
def nearest_neighbor(points):
    unvisited = list(range(len(points)))
    order = [unvisited.pop(0)]
    while unvisited:
        last_point = order[-1]
        next_point = min(unvisited, key=lambda x: distance(points[last_point], points[x]))
        order.append(next_point)
        unvisited.remove(next_point)
    return order

#Inverse l'ordre de deux segments du parcours pour essayer de diminuer la distance totale
def two_opt(order, points):
    n = len(order)
    total = 0
    improvement = True
    best_distance = total_distance(points, order)
    while improvement:
        improvement = False
        for i in range(n - 1):
            for j in range(i + 2, n):
                if j - i == 1:
                    continue
                new_order = order[:]
                new_order[i + 1:j + 1] = reversed(order[i + 1:j + 1])
                new_distance = total_distance(points, new_order)
                if new_distance < best_distance:
                    order = new_order
                    best_distance = new_distance
                    improvement = True
    return order

#Combine l'utilisation de l'algorithme du plus proche voisin et test les segments sur chaque point pour déterminer le plus proche
def resolve_tsp(points):
    order = nearest_neighbor(points)
    order = two_opt(order, points)
    ordered_points = [points[i] for i in order]
    return ordered_points


app = Flask(__name__)
CORS(app)

@app.route('/run-script', methods=['POST'])

def run_script():
    data = request.json
    print(request.json)
    points = data['coordinates']
    order = resolve_tsp(points)
    return jsonify({"order": order})

if __name__ == "__main__":
    app.run(port=5000)

