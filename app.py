from flask import Flask, render_template, jsonify, request, session
import json
import random
import os

app = Flask(__name__)
app.config['STATIC_FOLDER'] = 'static'
app.secret_key = 'supersecretkey'

# Configurar Flask para UTF-8
app.config['JSON_AS_ASCII'] = False

# Ruta al archivo JSON
JSON_FILE_PATH = os.path.join('data', 'preguntas.json')

# Cargar preguntas desde el archivo JSON
with open(JSON_FILE_PATH, encoding='utf-8') as f:
    preguntas_data = json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/seleccionar_tipo', methods=['POST'])
def seleccionar_tipo():
    data = request.get_json()
    tipo_preguntas = data.get('tipo_preguntas')
    session['tipo_preguntas'] = tipo_preguntas
    session['preguntas_restantes'] = 5
    session['preguntas_hechas'] = []
    session['puntaje'] = 0
    return jsonify({'status': 'success'})

@app.route('/iniciar_juego')
def iniciar_juego():
    return render_template('game.html')

@app.route('/obtener_pregunta')
def obtener_pregunta():
    tipo_preguntas = session.get('tipo_preguntas')
    if session.get('preguntas_restantes', 0) > 0:
        if tipo_preguntas == 'con_imagenes':
            preguntas_disponibles = [p for p in preguntas_data if 'imagen' in p and preguntas_data.index(p) not in session['preguntas_hechas']]
        else:
            preguntas_disponibles = [p for p in preguntas_data if 'imagen' not in p and preguntas_data.index(p) not in session['preguntas_hechas']]

        if preguntas_disponibles:
            pregunta_data = random.choice(preguntas_disponibles)
            pregunta_id = preguntas_data.index(pregunta_data)
            session['preguntas_hechas'].append(pregunta_id)
            session['preguntas_restantes'] -= 1

            opciones = pregunta_data['respuestas']
            random.shuffle(opciones)
            return jsonify({
                'pregunta': pregunta_data['pregunta'],
                'imagen': pregunta_data.get('imagen', ''),
                'opciones': opciones,
                'id': pregunta_id,
                'preguntas_restantes': session['preguntas_restantes']
            })
        else:
            return jsonify({'fin_juego': True, 'puntaje': session['puntaje']})
    else:
        return jsonify({'fin_juego': True, 'puntaje': session['puntaje']})

@app.route('/verificar_respuesta', methods=['POST'])
def verificar_respuesta():
    data = request.json
    pregunta_data = preguntas_data[data['id']]
    correcta = data['respuesta'] == pregunta_data['respuesta_correcta']
    if correcta:
        session['puntaje'] += 1
    return jsonify({'correcta': correcta, 'puntaje': session['puntaje']})

@app.route('/game_over')
def game_over():
    puntaje = session.get('puntaje', 0)
    return render_template('game_over.html', puntaje=puntaje)

if __name__ == '__main__':
    app.run(debug=True)
