from flask import Flask, request, jsonify, send_from_directory
import json
import os
from datetime import datetime

app = Flask(__name__, static_folder='static')

# Criar pasta para armazenar rankings se não existir
if not os.path.exists('data'):
    os.makedirs('data')

RANKINGS_FILE = 'data/rankings.json'

# Carregar rankings existentes ou criar novo arquivo
def load_rankings():
    if os.path.exists(RANKINGS_FILE):
        with open(RANKINGS_FILE, 'r') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

# Salvar rankings
def save_rankings(rankings):
    with open(RANKINGS_FILE, 'w') as f:
        json.dump(rankings, f)

# Rota principal - serve o jogo
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

# API para obter rankings
@app.route('/api/rankings', methods=['GET'])
def get_rankings():
    difficulty = request.args.get('difficulty', None)
    rankings = load_rankings()
    
    if difficulty:
        rankings = [r for r in rankings if r.get('difficulty') == difficulty]
    
    # Ordenar por pontuação (maior para menor)
    rankings.sort(key=lambda x: x.get('score', 0), reverse=True)
    
    # Limitar a 10 melhores pontuações
    rankings = rankings[:10]
    
    return jsonify(rankings)

# API para salvar nova pontuação
@app.route('/api/rankings', methods=['POST'])
def save_score():
    data = request.json
    
    # Validar dados recebidos
    required_fields = ['name', 'score', 'difficulty', 'time', 'moves']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Campo obrigatório ausente: {field}'}), 400
    
    # Criar registro de pontuação
    new_score = {
        'name': data['name'],
        'score': int(data['score']),
        'difficulty': data['difficulty'],
        'time': data['time'],
        'moves': int(data['moves']),
        'date': datetime.now().isoformat()
    }
    
    # Carregar rankings existentes
    rankings = load_rankings()
    
    # Adicionar nova pontuação
    rankings.append(new_score)
    
    # Ordenar por pontuação (maior para menor)
    rankings.sort(key=lambda x: x.get('score', 0), reverse=True)
    
    # Limitar a 100 registros para evitar arquivo muito grande
    rankings = rankings[:100]
    
    # Salvar rankings atualizados
    save_rankings(rankings)
    
    return jsonify({'success': True, 'message': 'Pontuação salva com sucesso!'})

# Servir arquivos estáticos
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)