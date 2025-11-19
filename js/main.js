const API_KEY = 'AIzaSyBAokaWHhmqRI9D4a2kRPtvJjz6Ga5wAeM';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const loadingIndicator = document.getElementById('loadingIndicator');

const DEFAULT_USER_STATS = {
    messagesCount: 0,
    quizzesCompleted: 0,
    challengesCompleted: 0,
    daysStreak: 0,
    playlistsListened: 0
};

const achievements = [
    { id: 1, icon: '🌟', title: 'Primera Conversación', desc: 'Envía tu primer mensaje', requirement: 'messagesCount', target: 1 },
    { id: 2, icon: '💬', title: 'Conversador', desc: 'Envía 10 mensajes', requirement: 'messagesCount', target: 10 },
    { id: 3, icon: '🗣️', title: 'Gran Comunicador', desc: 'Envía 50 mensajes', requirement: 'messagesCount', target: 50 },
    { id: 4, icon: '📝', title: 'Explorador Mental', desc: 'Completa tu primer test', requirement: 'quizzesCompleted', target: 1 },
    { id: 5, icon: '🎯', title: 'Desafiante', desc: 'Completa tu primer desafío', requirement: 'challengesCompleted', target: 1 },
    { id: 6, icon: '🎵', title: 'Melómano', desc: 'Escucha 3 playlists', requirement: 'playlistsListened', target: 3 },
    { id: 7, icon: '🔥', title: 'Racha de 7 días', desc: 'Usa la app 7 días seguidos', requirement: 'daysStreak', target: 7 },
    { id: 8, icon: '🏆', title: 'Maestro del Bienestar', desc: 'Completa 5 tests', requirement: 'quizzesCompleted', target: 5 }
];

const quizzes = [
    {
        id: 1,
        title: 'Test de Ansiedad',
        description: 'Evalúa tu nivel de ansiedad actual',
        tags: ['Ansiedad', '5 min'],
        questions: [
            {
                question: '¿Con qué frecuencia te sientes nervioso o al borde?',
                options: ['Nunca', 'A veces', 'Frecuentemente', 'Casi siempre']
            },
            {
                question: '¿Tienes dificultad para controlar la preocupación?',
                options: ['Nunca', 'A veces', 'Frecuentemente', 'Casi siempre']
            },
            {
                question: '¿Experimentas tensión muscular o inquietud?',
                options: ['Nunca', 'A veces', 'Frecuentemente', 'Casi siempre']
            },
            {
                question: '¿Tienes problemas para dormir debido a preocupaciones?',
                options: ['Nunca', 'A veces', 'Frecuentemente', 'Casi siempre']
            }
        ]
    },
    {
        id: 2,
        title: 'Test de Estado de Ánimo',
        description: 'Descubre cómo te sientes hoy',
        tags: ['Bienestar', '3 min'],
        questions: [
            {
                question: '¿Cómo describirías tu energía hoy?',
                options: ['Muy baja', 'Baja', 'Normal', 'Alta']
            },
            {
                question: '¿Has disfrutado de actividades que normalmente te gustan?',
                options: ['Para nada', 'Poco', 'Moderadamente', 'Mucho']
            },
            {
                question: '¿Cómo calificarías tu motivación?',
                options: ['Muy baja', 'Baja', 'Buena', 'Excelente']
            }
        ]
    },
    {
        id: 3,
        title: 'Test de Estrés',
        description: 'Mide tu nivel de estrés actual',
        tags: ['Estrés', '4 min'],
        questions: [
            {
                question: '¿Te sientes abrumado por tus responsabilidades?',
                options: ['Nunca', 'Raramente', 'A menudo', 'Siempre']
            },
            {
                question: '¿Experimentas dolores de cabeza o tensión?',
                options: ['Nunca', 'Raramente', 'A menudo', 'Siempre']
            },
            {
                question: '¿Te cuesta concentrarte en tareas?',
                options: ['Nunca', 'Raramente', 'A menudo', 'Siempre']
            },
            {
                question: '¿Sientes que no tienes tiempo para ti?',
                options: ['Nunca', 'Raramente', 'A menudo', 'Siempre']
            }
        ]
    }
];

const CHALLENGE_DEFAULTS = [
    {
        id: 1,
        title: 'Gratitud Diaria',
        description: 'Escribe 3 cosas por las que estés agradecido durante 7 días',
        status: 'active',
        progress: 0,
        target: 7,
        days: []
    },
    {
        id: 2,
        title: 'Meditación Semanal',
        description: 'Medita 10 minutos al día durante una semana',
        status: 'active',
        progress: 0,
        target: 7,
        days: []
    },
    {
        id: 3,
        title: 'Ejercicio Regular',
        description: 'Haz 30 minutos de ejercicio 5 veces esta semana',
        status: 'active',
        progress: 0,
        target: 5,
        days: []
    },
    {
        id: 4,
        title: 'Desconexión Digital',
        description: 'Pasa 2 horas sin pantallas antes de dormir durante 3 días',
        status: 'active',
        progress: 0,
        target: 3,
        days: []
    },
    {
        id: 5,
        title: 'Respiración Consciente',
        description: 'Practica respiración profunda 3 veces al día por 5 días',
        status: 'active',
        progress: 0,
        target: 5,
        days: []
    }
];

let userStats = { ...DEFAULT_USER_STATS };
let challenges = [ ...CHALLENGE_DEFAULTS ];

const playlists = [
    {
        id: 1,
        name: 'Calma y Relajación',
        description: 'Música suave para reducir el estrés',
        icon: '🧘',
        url: 'https://open.spotify.com/playlist/37i9dQZF1DWU0ScTcjJBdj'
    },
    {
        id: 2,
        name: 'Motivación Positiva',
        description: 'Canciones inspiradoras para levantar el ánimo',
        icon: '⚡',
        url: 'https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0'
    },
    {
        id: 3,
        name: 'Enfoque y Concentración',
        description: 'Música instrumental para trabajar o estudiar',
        icon: '🎯',
        url: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ'
    },
    {
        id: 4,
        name: 'Meditación Profunda',
        description: 'Sonidos ambientales para meditar',
        icon: '🕉️',
        url: 'https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u'
    },
    {
        id: 5,
        name: 'Energía Matutina',
        description: 'Comienza tu día con el pie derecho',
        icon: '☀️',
        url: 'https://open.spotify.com/playlist/37i9dQZF1DX0UrRvztWcAU'
    },
    {
        id: 6,
        name: 'Sueño Tranquilo',
        description: 'Melodías suaves para dormir mejor',
        icon: '🌙',
        url: 'https://open.spotify.com/playlist/37i9dQZF1DX7aAuYd7Jogj?si=hDHa3H6KR1Gx8BF2XUtNxQ'
    }
];

const systemContext = `Eres MenteSerena, un asistente conversacional inteligente y empático. Puedes hablar sobre cualquier tema y mantener conversaciones naturales y fluidas.

Características de tu personalidad:
- Eres amigable, empático y conversacional
- Tienes conocimientos amplios sobre diversos temas
- Se cariñoso y muy tierno con la persona si detectas mucha tristeza
- Cuando detectes que alguien necesita apoyo emocional, ofreces comprensión y consejos útiles
- Mantienes conversaciones naturales con preguntas de seguimiento
- Eres curioso sobre los intereses de la persona
- En temas de salud mental, siempre recomiendas buscar ayuda profesional si es necesario
- Comparte mensajes motivacionales
- Si detectas tristeza recomienda que se contacten a este número de emergencia 3172253657
- Trata de responder algo no tan largo, sé lo más resumido posible

Responde siempre en español de manera natural, como si fueras un amigo inteligente y comprensivo.`;

let conversationHistory = [
    {
        role: "user",
        parts: [{text: systemContext}]
    },
    {
        role: "model",
        parts: [{text: "Entendido. Soy MenteSerena y estoy aquí para brindarte apoyo emocional de manera empática y comprensiva. Estoy listo para escucharte y ayudarte."}]
    }
];

function loadData() {
    const userData = UserManager.getCurrentUserData();
    if (!userData) {
        window.location.href = 'Login.html';
        return;
    }
    
    userStats = userData.stats || DEFAULT_USER_STATS;
    challenges = userData.challenges || CHALLENGE_DEFAULTS;
    conversationHistory = userData.conversationHistory || conversationHistory;

    if (challenges.length < CHALLENGE_DEFAULTS.length) {
        challenges = CHALLENGE_DEFAULTS.map(defaultCh => {
            const savedCh = challenges.find(c => c.id === defaultCh.id);
            return savedCh ? { ...defaultCh, ...savedCh } : defaultCh;
        });
    }
}

function saveData() {
    const data = {
        stats: userStats,
        challenges: challenges,
        conversationHistory: conversationHistory.slice(-20),
        lastVisit: new Date().toDateString()
    };
    
    UserManager.saveCurrentUserData(data);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'achievements') {
        renderAchievements();
    } else if (tabName === 'quizzes') {
        renderQuizzes();
    } else if (tabName === 'challenges') {
        renderChallenges();
    } else if (tabName === 'music') {
        renderMusic();
    }
}

function renderAchievements() {
    const container = document.getElementById('achievementsContainer');
    container.innerHTML = achievements.map(achievement => {
        const progress = userStats[achievement.requirement] || 0;
        const percentage = Math.min((progress / achievement.target) * 100, 100);
        const isUnlocked = progress >= achievement.target;
        
        return `
            <div class="achievement-card">
                <div class="achievement-icon ${!isUnlocked ? 'locked' : ''}">
                    ${achievement.icon}
                </div>
                <div class="achievement-info">
                    <div class="achievement-title">${achievement.title}</div>
                    <div class="achievement-desc">${achievement.desc}</div>
                    <div class="achievement-progress">
                        <div class="achievement-progress-bar" style="width: ${percentage}%"></div>
                    </div>
                    <small style="color: #667eea; margin-top: 5px; display: block;">
                        ${progress}/${achievement.target} ${isUnlocked ? '✅ Completado' : ''}
                    </small>
                </div>
            </div>
        `;
    }).join('');
}

let currentQuiz = null;
let currentQuizAnswers = [];

function renderQuizzes() {
    const container = document.getElementById('quizContainer');
    
    if (currentQuiz) {
        renderActiveQuiz(container);
    } else {
        container.innerHTML = `
            <div class="quiz-list">
                ${quizzes.map(quiz => `
                    <div class="quiz-card" onclick="startQuiz(${quiz.id})">
                        <h3>${quiz.title}</h3>
                        <p>${quiz.description}</p>
                        <div>
                            ${quiz.tags.map(tag => `<span class="quiz-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function startQuiz(quizId) {
    currentQuiz = quizzes.find(q => q.id === quizId);
    currentQuizAnswers = [];
    renderQuizzes();
}

function renderActiveQuiz(container) {
    const questionIndex = currentQuizAnswers.length;
    
    if (questionIndex >= currentQuiz.questions.length) {
        showQuizResults(container);
        return;
    }
    
    const question = currentQuiz.questions[questionIndex];
    
    container.innerHTML = `
        <div class="quiz-active">
            <h2 style="color: #667eea; margin-bottom: 20px;">${currentQuiz.title}</h2>
            <p style="color: #666; margin-bottom: 20px;">Pregunta ${questionIndex + 1} de ${currentQuiz.questions.length}</p>
            
            <div class="quiz-question">
                <h3>${question.question}</h3>
                ${question.options.map((option, index) => `
                    <div class="quiz-option" onclick="selectQuizOption(${index})">
                        ${option}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function selectQuizOption(optionIndex) {
    currentQuizAnswers.push(optionIndex);
    renderQuizzes();
}

function showQuizResults(container) {
    const totalScore = currentQuizAnswers.reduce((sum, answer) => sum + answer, 0);
    const maxScore = currentQuiz.questions.length * 3;
    const percentage = (totalScore / maxScore) * 100;
    
    let resultMessage = '';
    let resultEmoji = '';
    
    if (percentage < 30) {
        resultMessage = '¡Excelente! Tu nivel está en un rango muy saludable. Sigue cuidándote.';
        resultEmoji = '😊';
    } else if (percentage < 60) {
        resultMessage = 'Tu nivel está en un rango moderado. Considera practicar técnicas de relajación.';
        resultEmoji = '😌';
    } else {
        resultMessage = 'Tu nivel parece elevado. Te recomendamos hablar con un profesional de salud mental.';
        resultEmoji = '🤗';
    }
    
    userStats.quizzesCompleted++;
    saveData();
    checkAchievements();
    
    container.innerHTML = `
        <div class="quiz-active">
            <div class="quiz-results">
                <h2>${resultEmoji} Resultados</h2>
                <p style="font-size: 24px; margin: 20px 0;">${Math.round(percentage)}%</p>
                <p>${resultMessage}</p>
                <button class="quiz-button" onclick="finishQuiz()">Volver a Tests</button>
                <button class="quiz-button" onclick="switchTab('chat')" style="background: white; color: #667eea; border: 2px solid #667eea; margin-left: 10px;">
                    Hablar con MenteSerena
                </button>
            </div>
        </div>
    `;
}

function finishQuiz() {
    currentQuiz = null;
    currentQuizAnswers = [];
    renderQuizzes();
}

function renderChallenges() {
    const container = document.getElementById('challengesContainer');
    container.innerHTML = challenges.map(challenge => {
        const percentage = (challenge.progress / challenge.target) * 100;
        const isCompleted = challenge.status === 'completed';
        
        return `
            <div class="challenge-card">
                <div class="challenge-header">
                    <div class="challenge-title">${challenge.title}</div>
                    <div class="challenge-status ${challenge.status}">
                        ${isCompleted ? 'Completado' : 'Activo'}
                    </div>
                </div>
                <div class="challenge-desc">${challenge.description}</div>
                <div class="challenge-progress">
                    <div class="challenge-progress-text">
                        Progreso: ${challenge.progress}/${challenge.target}
                    </div>
                    <div class="challenge-progress-bar">
                        <div class="challenge-progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                ${!isCompleted ? `
                    <button class="challenge-button" onclick="updateChallenge(${challenge.id})">
                        ✓ Marcar como completado hoy
                    </button>
                ` : ''}
            </div>
        `;
    }).join('');
}

function updateChallenge(challengeId) {
    const challenge = challenges.find(c => c.id === challengeId);
    const today = new Date().toDateString();
    
    if (!challenge.days.includes(today)) {
        challenge.progress++;
        challenge.days.push(today);
        
        if (challenge.progress >= challenge.target) {
            challenge.status = 'completed';
            userStats.challengesCompleted++;
            showNotification('🎉 ¡Desafío completado! Has desbloqueado un logro.');
            checkAchievements();
        }
        
        saveData();
        renderChallenges();
    } else {
        showNotification('✅ Ya completaste este desafío hoy. ¡Vuelve mañana!');
    }
}

function renderMusic() {
    const container = document.getElementById('musicContainer');
    container.innerHTML = `
        <div style="text-align: center; padding: 20px; background: white; border-radius: 15px; margin-bottom: 20px;">
            <h2 style="color: #667eea; margin-bottom: 10px;">🎵 Playlists para tu Bienestar</h2>
            <p style="color: #666;">Música seleccionada para diferentes estados emocionales</p>
        </div>
        ${playlists.map(playlist => `
            <div class="playlist-card">
                <div class="playlist-header">
                    <div class="playlist-icon">${playlist.icon}</div>
                    <div class="playlist-info">
                        <h3>${playlist.name}</h3>
                        <p>${playlist.description}</p>
                    </div>
                </div>
                <button class="playlist-button" onclick="openPlaylist('${playlist.url}', ${playlist.id})">
                    ▶ Escuchar en Spotify
                </button>
            </div>
        `).join('')}
    `;
}

function openPlaylist(url, playlistId) {
    userStats.playlistsListened++;
    saveData();
    checkAchievements();
    showNotification('🎵 Abriendo playlist en Spotify...');
    window.open(url, '_blank');
}

function checkAchievements() {
    achievements.forEach(achievement => {
        const progress = userStats[achievement.requirement] || 0;
        if (progress >= achievement.target) {
            const wasLocked = !achievement.unlocked;
            achievement.unlocked = true;
            
            if (wasLocked) {
                showNotification(`🏆 ¡Logro desbloqueado! ${achievement.title}`);
            }
        }
    });
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 2000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function sendQuickMessage(message) {
    messageInput.value = message;
    sendMessage();
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    messageInput.value = '';
    addMessage(message, 'user');
    showLoading();

    userStats.messagesCount++;
    saveData();
    checkAchievements();

    try {
        conversationHistory.push({
            role: "user",
            parts: [{text: message}]
        });

        const requestBody = {
            contents: conversationHistory.slice(-10),
            generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.9,
                maxOutputTokens: 1000,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };

        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        hideLoading();

        if (data.candidates && data.candidates[0]) {
            const botResponse = data.candidates[0].content.parts[0].text;
            
            conversationHistory.push({
                role: "model",
                parts: [{text: botResponse}]
            });

            addMessage(botResponse, 'bot');
        } else {
            throw new Error('No se pudo obtener una respuesta válida');
        }

    } catch (error) {
        hideLoading();
        let errorMessage = 'Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.';
        addMessage(errorMessage, 'bot');
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.innerHTML = formatMessage(text);
    
    messageDiv.appendChild(bubbleDiv);
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function formatMessage(text) {
    return text
        .split('\n\n')
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .map(paragraph => `<p style="margin-bottom: 10px;">${paragraph}</p>`)
        .join('');
}

function showLoading() {
    loadingIndicator.style.display = 'flex';
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideLoading() {
    loadingIndicator.style.display = 'none';
}

function goBack() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        UserManager.logout();
        window.location.href = "Login.html";
    }
}

window.onload = function() {
    loadData();
    messageInput.focus();
    
    const userData = UserManager.getCurrentUserData();
    if (userData) {
        const lastVisit = userData.lastVisit;
        const today = new Date().toDateString();

        if (lastVisit !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastVisit === yesterday.toDateString()) {
                userStats.daysStreak = (userStats.daysStreak || 0) + 1;
            } else {
                userStats.daysStreak = 1;
            }
            
            saveData();
            checkAchievements();
        }
    }
    
    setTimeout(() => {
        addMessage('¡Hola! 😊 Soy MenteSerena. Puedo conversar contigo sobre lo que quieras. También puedes explorar los tests, desafíos y playlists que tengo para ti. ¿Qué te gustaría hacer hoy?', 'bot');
    }, 1000);

            // Verificar racha de días
            const saved = localStorage.getItem('menteSerenaData');
            if (saved) {
                const data = JSON.parse(saved);
                const lastVisit = data.lastVisit;
                const today = new Date().toDateString();
                
                if (lastVisit !== today) {
                    // Nueva visita
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    if (lastVisit === yesterday.toDateString()) {
                        userStats.daysStreak++;
                    } else {
                        userStats.daysStreak = 1;
                    }
                    
                    saveData();
                    checkAchievements();
                }
            }
        };