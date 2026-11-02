const URL = "./model/"; 
let model, webcam, maxPredictions;

let letraActual = "";
let frase = "";
let contadorEstabilidad = 0;
const FRAMES_NECESARIOS = 15; 
let cooldown = false; 
let ultimaLetraEscrita = "";

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        document.getElementById("estado-modelo").innerText = "Estado: Cargando modelo...";
        
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        const flip = true; 
        webcam = new tmImage.Webcam(400, 300, flip); 
        await webcam.setup(); 
        await webcam.play();
        
        document.getElementById("btnIniciar").style.display = "none";
        document.getElementById("estado-modelo").innerText = "Estado: Cámara Activa 🟢";
        
        window.requestAnimationFrame(loop);
        document.getElementById("webcam-container").appendChild(webcam.canvas);
    } catch (error) {
        console.error("Error al cargar:", error);
        document.getElementById("estado-modelo").innerText = "Error: Revisa que la carpeta 'model' exista y tenga los archivos correctos.";
    }
}

async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

async function predict() {
    const prediction = await model.predict(webcam.canvas);
    
    let highestProb = 0;
    let bestClass = "";

    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highestProb) {
            highestProb = prediction[i].probability;
            bestClass = prediction[i].className;
        }
    }

    const letraDisplay = document.getElementById("letra-actual");

    if (highestProb > 0.85) {
        letraDisplay.innerText = bestClass;
        letraActual = bestClass;

        if (letraActual === ultimaLetraEscrita) {
            contadorEstabilidad = 0;
        } else {
            contadorEstabilidad++;
            
            if (contadorEstabilidad >= FRAMES_NECESARIOS && !cooldown) {
                escribirLetra(letraActual);
                ultimaLetraEscrita = letraActual;
                cooldown = true;
                
                setTimeout(() => { 
                    cooldown = false; 
                    contadorEstabilidad = 0;
                }, 1500);
            }
        }
    } else {
        letraDisplay.innerText = "-";
        contadorEstabilidad = 0;
        
        if (highestProb < 0.5) {
            ultimaLetraEscrita = "";
        }
    }
}

function escribirLetra(letra) {
    frase += letra;
    actualizarPantallaFrase();
}

function actualizarPantallaFrase() {
    const cajaFrase = document.getElementById("frase-construida");
    const mensajeFinal = document.getElementById("mensaje-final");
    
    if (frase === "") {
        cajaFrase.innerText = "Escribe aquí...";
        mensajeFinal.innerText = "";
    } else {
        cajaFrase.innerText = frase;
        mensajeFinal.innerText = `La palabra o frase es: "${frase}"`;
    }
}

function borrarUltimaLetra() {
    frase = frase.slice(0, -1);
    actualizarPantallaFrase();
    ultimaLetraEscrita = "";
}

function borrarTodo() {
    frase = "";
    ultimaLetraEscrita = "";
    actualizarPantallaFrase();
}

function agregarEspacio() {
    frase += " ";
    actualizarPantallaFrase();
    ultimaLetraEscrita = "";
}