// --- CONFIGURACIÓN DE AUDIOS ---
// Si tus archivos son .wav, cambia .mp3 por .wav abajo
const bgMusic = new Audio('sound/Amor en 8 bits.mp3');
bgMusic.loop = true; // Loop infinito
bgMusic.volume = 0.5; // Volumen al 50% para no aturdir

const correctFx = new Audio('sound/correct.mp3');
const incorrectFx = new Audio('sound/incorrect.mp3');

// --- CONFIGURACIÓN DE IMÁGENES ---
const cardImages = [
    'images/ft1.jpg',
    'images/ft2.jpg',
    'images/ft3.jpg',
    'images/ft4.jpg',
    'images/ft5.jpg',
    'images/ft6.jpg'
];

// --- VARIABLES DE ESTADO ---
let gameGrid = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;
let timerInterval;
let timeLeft = 30;

// --- FUNCIONES DE NAVEGACIÓN ---

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Nueva función para iniciar audio en móviles (requiere interacción del usuario)
function initAudioAndStart() {
    // Intentamos reproducir y pausar inmediatamente para "desbloquear" el audio en Safari/Chrome Mobile
    bgMusic.play().then(() => {
        bgMusic.pause();
        bgMusic.currentTime = 0;
    }).catch(error => console.log("Audio waiting for interaction"));
    
    goToScreen2();
}

function goToScreen2() {
    showScreen('screen-2');
    setTimeout(() => {
        goToScreen3();
    }, 6000);
}

function goToScreen3() {
    showScreen('screen-3');
    
    // AQUÍ EMPIEZA LA MÚSICA DE FONDO
    bgMusic.play().catch(e => console.log("Error playing audio: ", e));

    let countdown = 5;
    const countText = document.getElementById('countdown-text');
    countText.innerText = countdown;

    const interval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            countText.innerText = countdown;
        } else {
            clearInterval(interval);
            startGame();
        }
    }, 1000);
}

// --- LÓGICA DEL JUEGO ---

function startGame() {
    showScreen('screen-4');
    resetGameVariables();
    createBoard();
    
    // Mostrar cartas por 3 segundos
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.classList.add('flipped')); 
    lockBoard = true;

    setTimeout(() => {
        allCards.forEach(card => card.classList.remove('flipped')); 
        lockBoard = false; 
        startTimer(); 
    }, 3000);
}

function resetGameVariables() {
    moves = 0;
    matches = 0;
    timeLeft = 30;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    document.getElementById('moves').innerText = '0';
    document.getElementById('time').innerText = '30';
    clearInterval(timerInterval);
}

function createBoard() {
    const grid = document.getElementById('game-grid');
    grid.innerHTML = '';
    
    // Duplicar array y mezclar
    let deck = [...cardImages, ...cardImages];
    deck.sort(() => 0.5 - Math.random());

    deck.forEach(imgSrc => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.image = imgSrc;

        const frontFace = document.createElement('div');
        frontFace.classList.add('card-face', 'card-front');

        const backFace = document.createElement('div');
        backFace.classList.add('card-face', 'card-back');
        backFace.style.backgroundImage = `url('${imgSrc}')`;

        cardElement.appendChild(frontFace);
        cardElement.appendChild(backFace);
        
        cardElement.addEventListener('click', flipCard);
        grid.appendChild(cardElement);
    });
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flipped');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    document.getElementById('moves').innerText = moves;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.image === secondCard.dataset.image;
    
    if (isMatch) {
        // SONIDO CORRECTO
        correctFx.currentTime = 0; // Reinicia el sonido si ya estaba sonando
        correctFx.play();
        disableCards();
    } else {
        // SONIDO INCORRECTO
        incorrectFx.currentTime = 0;
        incorrectFx.play();
        unflipCards();
    }
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
    matches++;
    if (matches === cardImages.length) {
        gameWon();
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flipped');
        secondCard.classList.remove('flipped');
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

// --- TEMPORIZADOR Y FINALIZACIÓN ---

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('time').innerText = timeLeft;
        if (timeLeft <= 0) {
            gameLost();
        }
    }, 1000);
}

function gameLost() {
    clearInterval(timerInterval);
    // PAUSAR MÚSICA DE FONDO AL TERMINAR
    bgMusic.pause();
    bgMusic.currentTime = 0;
    
    showScreen('screen-5');
}

function gameWon() {
    clearInterval(timerInterval);
    // PAUSAR MÚSICA DE FONDO AL GANAR
    bgMusic.pause();
    bgMusic.currentTime = 0;

    setTimeout(() => {
        showScreen('screen-6');
    }, 500);
}

// --- REINICIAR Y SALIR ---

function restartGame(retry) {
    if (retry) {
        // Si reinicia, nos aseguramos que la música suene (por si acaso)
        bgMusic.currentTime = 0;
        bgMusic.play();
        startGame(); 
    } else {
        exitGame();
    }
}

function exitGame() {
    clearInterval(timerInterval);
    // DETENER MÚSICA
    bgMusic.pause();
    bgMusic.currentTime = 0;
    
    showScreen('screen-1');
}