document.addEventListener('DOMContentLoaded', () => {
    let preguntasHechas = 0;
    let tiempoRestante = 10;  // Tiempo en segundos para responder cada pregunta
    let cronometroIntervalo;
//Funcion para optener las preguntas
    function obtenerPregunta() {
        fetch('/obtener_pregunta')
        .then(response => response.json())
        .then(data => {
            if (data.fin_juego) {
                //alert(`Juego terminado! Tu puntaje es: ${data.puntaje}`);
                document.getElementById('final-score').textContent = data.puntaje;
                document.getElementById('game-over-modal').style.display = 'block'
                //window.location.href = '/game_over';
            } else {
                document.getElementById('pregunta').textContent = data.pregunta;
                
                // Mostrar la imagen de la pregunta si existe
                const imagenPreguntaDiv = document.getElementById('imagen-pregunta');
                imagenPreguntaDiv.innerHTML = '';
                if (data.imagen) {
                    const imgElement = document.createElement('img');
                    imgElement.src = data.imagen;
                    imgElement.style.width = '300px'; //Tamanho de ancho
                    imgElement.style.height = '300px';//Tamanho de altura
                    imagenPreguntaDiv.appendChild(imgElement);
                }

                const opcionesDiv = document.getElementById('opciones');
                opcionesDiv.innerHTML = '';
                data.opciones.forEach(opcion => {
                    const button = document.createElement('button');
                    button.textContent = opcion;
                    button.className = 'opcion';
                    button.onclick = () => verificarRespuesta(opcion, data.id);
                    opcionesDiv.appendChild(button);
                });
                iniciarCronometro();
            }
        });
    }
    //Funcion para verificar respuesta
    function verificarRespuesta(respuesta, id) {
        clearInterval(cronometroIntervalo);
        fetch('/verificar_respuesta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ respuesta: respuesta, id: id })
        })
        .then(response => response.json())
        .then(data => {
            const botones = document.querySelectorAll('#opciones button');
            botones.forEach(boton => {
                if (boton.textContent === respuesta) {
                    if (data.correcta) {
                        boton.textContent = "Correcto!";
                        boton.style.backgroundColor = "green"; //El color de boton correcto en verde
                        boton.style.color = "#fff" // poner el texto dek correcto en blanco
                        const puntajeSpan = document.getElementById('puntaje');
                        puntajeSpan.textContent = data.puntaje;
                    } else {
                        boton.textContent = "Incorrecto";
                        boton.style.backgroundColor = "red"; //El color de boton incorrecto en rojo
                        boton.style.color = "#fff" // poner el texto dek correcto en blanco
                    }
                }
                boton.disabled = true;
            });
            preguntasHechas++;

            if (preguntasHechas >= 5) {
                //alert(`Juego terminado! Tu puntaje es: ${data.puntaje}`);
                window.location.href = '/game_over';
            } else {
                setTimeout(obtenerPregunta, 2000);
            }
        });
    }
//Funcion que inicia el cronometro 
    function iniciarCronometro() {
        tiempoRestante = 10;  // Reiniciar el tiempo
        document.getElementById('cronometro').textContent = tiempoRestante;
        cronometroIntervalo = setInterval(() => {
            tiempoRestante--;
            document.getElementById('cronometro').textContent = tiempoRestante;
            if (tiempoRestante <= 0) {
                clearInterval(cronometroIntervalo);
                desactivarBotones();
                setTimeout(obtenerPregunta, 2000);  // Pasar a la siguiente pregunta después de 2 segundos
            }
        }, 1000);
    }
//Funcion que desctiva los botones al terminar el tiempo 
    function desactivarBotones() {
        const botones = document.querySelectorAll('.opcion');
        botones.forEach(button => {
            button.disabled = true;
        });
    }

    obtenerPregunta();
});
