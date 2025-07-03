// Ti Moun Savoir AI - PWA JavaScript

// Variables globales
let currentInterface = 'menu';
let currentQuiz = null;
let currentQuestion = 0;
let quizScore = 0;
let userData = {
    name: 'Marie',
    age: 8,
    points: 147,
    quizCompleted: 23,
    storiesRead: 12,
    contributions: 5
};

// Données des quiz
const quizData = {
    mathematiques: [
        {
            question: "🐢 Sur la plage de Yalimapo, il y a 8 tortues luth qui pondent. 3 retournent à la mer. Combien restent sur la plage ?",
            options: ["5 tortues", "11 tortues", "3 tortues", "8 tortues"],
            correct: 0,
            explanation: "8 - 3 = 5 tortues restent sur la belle plage de Yalimapo !"
        },
        {
            question: "🥭 Grand-père a cueilli 12 mangues dans son jardin. Il en donne 4 à chaque petit-enfant. Combien d'enfants peuvent avoir des mangues ?",
            options: ["2 enfants", "3 enfants", "4 enfants", "6 enfants"],
            correct: 1,
            explanation: "12 ÷ 4 = 3 enfants peuvent avoir de délicieuses mangues de Guyane !"
        },
        {
            question: "💰 Au marché de Cayenne, maman achète 6 bananes à 50 centimes chacune. Combien paie-t-elle ?",
            options: ["2€50", "3€00", "3€50", "4€00"],
            correct: 1,
            explanation: "6 × 0,50€ = 3€00 pour ces bonnes bananes du marché !"
        }
    ],
    culture: [
        {
            question: "🏛️ Quelle est la capitale de la Guyane française ?",
            options: ["Kourou", "Saint-Laurent-du-Maroni", "Cayenne", "Maripasoula"],
            correct: 2,
            explanation: "Cayenne est la capitale et la plus grande ville de Guyane !"
        },
        {
            question: "🌍 Dans quel département français se trouve la base spatiale de Kourou ?",
            options: ["Martinique", "Guadeloupe", "Guyane", "Réunion"],
            correct: 2,
            explanation: "La base spatiale de Kourou est en Guyane française !"
        }
    ]
};

// Données des histoires
const storiesData = [
    {
        id: 1,
        title: "Kompè Lapin et le Jaguar",
        summary: "Comment Kompè Lapin utilise sa ruse pour échapper au puissant Jaguar de la forêt guyanaise.",
        language: "Créole Guyanais",
        duration: "8 min",
        ageGroup: "5-10 ans",
        category: "Conte traditionnel"
    },
    {
        id: 2,
        title: "L'Esprit du Baobab",
        summary: "Légende kalina sur l'arbre sacré qui protège le village des esprits maléfiques.",
        language: "Kalina",
        duration: "12 min",
        ageGroup: "7-12 ans",
        category: "Légende amérindienne"
    }
];

// Données des contributions demo
let contributionsData = [
    { french: "Bonjour", local: "Bonjou", language: "Créole Guyanais", contributor: "Marie-Claire" },
    { french: "Au revoir", local: "Orevwa", language: "Créole Guyanais", contributor: "Jean-Luc" },
    { french: "Merci", local: "Mèsi", language: "Créole Guyanais", contributor: "Sylvie" }
];

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 Ti Moun Savoir AI PWA chargé !');

    // Initialiser les événements
    initializeEventListeners();

    // Charger les données utilisateur
    loadUserData();

    // Vérifier le statut de connexion
    updateConnectionStatus();

    // Afficher les contributions récentes
    displayRecentContributions();

    // Afficher les histoires
    displayStories();

    // Initialiser les badges
    initializeBadges();

    // Analytics
    trackEvent('app_started', {
        platform: 'pwa',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
    });
});

// Initialiser les événements
function initializeEventListeners() {
    // Navigation principale
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.currentTarget.getAttribute('data-action');
            handleNavigation(action);
        });
    });

    // Sélecteur de langues
    document.querySelectorAll('.lang-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            changeLanguage(e.target.getAttribute('data-lang'));
        });
    });

    // Formulaire corpus
    const corpusForm = document.getElementById('corpusForm');
    if (corpusForm) {
        corpusForm.addEventListener('submit', handleCorpusSubmission);
    }

    // Bouton submit quiz
    const submitBtn = document.getElementById('submitAnswer');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleQuizSubmission);
    }

    // Événements réseau
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);

    // Prévenir le zoom sur double-tap
    document.addEventListener('touchend', function(e) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

let lastTouchEnd = 0;

// Gestion de la navigation
function handleNavigation(action) {
    // Mettre à jour la navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    document.querySelector(`[data-action="${action}"]`).classList.add('active');

    // Cacher toutes les interfaces
    document.querySelectorAll('.main-menu, .quiz-interface, .corpus-interface, .stories-interface, .progress-interface').forEach(section => {
        section.classList.add('hidden');
    });

    // Afficher l'interface correspondante
    switch(action) {
        case 'menu':
            document.getElementById('mainMenu').classList.remove('hidden');
            currentInterface = 'menu';
            break;
        case 'quiz':
            showQuizSelection();
            break;
        case 'stories':
            document.getElementById('storiesInterface').classList.remove('hidden');
            currentInterface = 'stories';
            break;
        case 'corpus':
            document.getElementById('corpusInterface').classList.remove('hidden');
            currentInterface = 'corpus';
            break;
        case 'progress':
            document.getElementById('progressInterface').classList.remove('hidden');
            updateProgressInterface();
            currentInterface = 'progress';
            break;
    }

    // Scroll to top
    window.scrollTo(0, 0);

    // Analytics
    trackEvent('navigation', { to: action });
}

// Affichage de la sélection de quiz
function showQuizSelection() {
    const quizTypes = Object.keys(quizData);
    const options = quizTypes.map(type =>
        `<button class="answer-option" onclick="startQuiz('${type}')">${type === 'mathematiques' ? '🔢 Mathématiques' : '🏛️ Culture Guyanaise'}</button>`
    ).join('');

    document.getElementById('quizInterface').classList.remove('hidden');
    document.getElementById('questionText').innerHTML = 'Choisis ton type de quiz :';
    document.getElementById('answerOptions').innerHTML = options;
    document.getElementById('submitAnswer').style.display = 'none';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressText').textContent = 'Sélection du quiz';

    currentInterface = 'quiz';
}

// Démarrer un quiz
function startQuiz(quizType) {
    currentQuiz = quizData[quizType];
    currentQuestion = 0;
    quizScore = 0;

    if (!currentQuiz || currentQuiz.length === 0) {
        showToast('⚠️ Quiz en développement !');
        return;
    }

    document.getElementById('quizTitle').textContent = `Quiz ${quizType === 'mathematiques' ? 'Mathématiques' : 'Culture Guyanaise'}`;
    document.getElementById('submitAnswer').style.display = 'block';
    document.getElementById('quizResults').classList.add('hidden');

    showQuestion();
    trackEvent('quiz_started', { type: quizType });
}

// Afficher une question
function showQuestion() {
    if (currentQuestion >= currentQuiz.length) {
        showQuizResults();
        return;
    }

    const question = currentQuiz[currentQuestion];

    // Mettre à jour l'interface
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('progressText').textContent = `Question ${currentQuestion + 1} sur ${currentQuiz.length}`;
    document.getElementById('progressFill').style.width = `${((currentQuestion + 1) / currentQuiz.length) * 100}%`;

    // Générer les options
    const optionsHTML = question.options.map((option, index) =>
        `<button class="answer-option" data-index="${index}">${String.fromCharCode(65 + index)}) ${option}</button>`
    ).join('');

    document.getElementById('answerOptions').innerHTML = optionsHTML;

    // Ajouter les événements aux options
    document.querySelectorAll('.answer-option').forEach((option, index) => {
        option.addEventListener('click', () => selectAnswer(index));
    });

    // Réinitialiser le bouton submit
    document.getElementById('submitAnswer').disabled = true;
    document.getElementById('submitAnswer').textContent = 'Choisir une réponse';
}

// Sélectionner une réponse
function selectAnswer(index) {
    // Enlever la sélection précédente
    document.querySelectorAll('.answer-option').forEach(option => {
        option.classList.remove('selected');
    });

    // Ajouter la nouvelle sélection
    document.querySelector(`[data-index="${index}"]`).classList.add('selected');

    // Activer le bouton submit
    document.getElementById('submitAnswer').disabled = false;
    document.getElementById('submitAnswer').textContent = '✅ Valider';

    // Vibration tactile si supportée
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

// Soumettre la réponse du quiz
function handleQuizSubmission() {
    const selectedOption = document.querySelector('.answer-option.selected');
    if (!selectedOption) {
        showToast('⚠️ Choisis une réponse d\'abord !');
        return;
    }

    const selectedIndex = parseInt(selectedOption.getAttribute('data-index'));
    const question = currentQuiz[currentQuestion];
    const isCorrect = selectedIndex === question.correct;

    if (isCorrect) {
        quizScore++;
        selectedOption.style.background = '#4ecdc4';
        selectedOption.style.color = 'white';
        showToast('🎉 Bravo ! Bonne réponse !');

        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    } else {
        selectedOption.style.background = '#ff6b35';
        selectedOption.style.color = 'white';
        document.querySelector(`[data-index="${question.correct}"]`).style.background = '#4ecdc4';
        document.querySelector(`[data-index="${question.correct}"]`).style.color = 'white';
        showToast('💡 ' + question.explanation);

        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }

    // Analytics
    trackEvent('quiz_answer', {
        question: currentQuestion + 1,
        correct: isCorrect,
        selected: selectedIndex,
        correctAnswer: question.correct
    });

    // Passer à la question suivante après un délai
    setTimeout(() => {
        currentQuestion++;
        showQuestion();
    }, 2000);
}

// Afficher les résultats du quiz
function showQuizResults() {
    const percentage = Math.round((quizScore / currentQuiz.length) * 100);
    const pointsEarned = quizScore * 10;

    // Mettre à jour l'affichage
    document.getElementById('finalScore').textContent = `${quizScore}/${currentQuiz.length}`;
    document.getElementById('scorePercentage').textContent = `${percentage}%`;
    document.getElementById('pointsEarned').textContent = pointsEarned;

    // Afficher les résultats
    document.querySelector('.question-card').classList.add('hidden');
    document.getElementById('quizResults').classList.remove('hidden');

    // Mettre à jour les points utilisateur
    userData.points += pointsEarned;
    userData.quizCompleted++;
    updateUserDisplay();
    saveUserData();

    // Analytics
    trackEvent('quiz_completed', {
        score: quizScore,
        total: currentQuiz.length,
        percentage: percentage,
        pointsEarned: pointsEarned
    });

    // Vibration de célébration
    if (navigator.vibrate && percentage >= 70) {
        navigator.vibrate([100, 50, 100, 50, 100, 50, 200]);
    }
}

// Redémarrer le quiz
function restartQuiz() {
    currentQuestion = 0;
    quizScore = 0;
    document.querySelector('.question-card').classList.remove('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    showQuestion();
}

// Retourner au menu
function showMenu() {
    handleNavigation('menu');
}

// Gestion du corpus
function handleCorpusSubmission(e) {
    e.preventDefault();

    const frenchText = document.getElementById('frenchText').value.trim();
    const localText = document.getElementById('localText').value.trim();
    const language = document.getElementById('languageSelect').value;

    // Validation
    if (!frenchText || !localText) {
        showToast('⚠️ Remplis tous les champs !');
        return;
    }

    if (frenchText.length < 2 || localText.length < 2) {
        showToast('⚠️ Expressions trop courtes !');
        return;
    }

    // Ajouter la contribution
    const newContribution = {
        french: frenchText,
        local: localText,
        language: language,
        contributor: userData.name,
        date: new Date().toISOString()
    };

    contributionsData.unshift(newContribution);

    // Mettre à jour les points
    userData.points += 15;
    userData.contributions++;
    updateUserDisplay();
    saveUserData();

    // Réinitialiser le formulaire
    document.getElementById('frenchText').value = '';
    document.getElementById('localText').value = '';

    // Mettre à jour l'affichage
    displayRecentContributions();

    // Feedback utilisateur
    showToast(`🌟 Mèsi ! "${localText}" ajouté au corpus !`);

    // Vibration de succès
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100, 50, 200]);
    }

    // Analytics
    trackEvent('corpus_contribution', {
        language: language,
        frenchLength: frenchText.length,
        localLength: localText.length
    });
}

// Afficher les contributions récentes
function displayRecentContributions() {
    const container = document.getElementById('contributionsList');
    if (!container) return;

    const html = contributionsData.slice(0, 5).map(contrib =>
        `<div class="contribution-item">
            💬 "${contrib.french}" → "${contrib.local}" (${contrib.language}) par ${contrib.contributor}
        </div>`
    ).join('');

    container.innerHTML = html;
}

// Afficher les histoires
function displayStories() {
    const container = document.getElementById('storiesGrid');
    if (!container) return;

    const html = storiesData.map(story =>
        `<div class="story-card" onclick="readStory(${story.id})">
            <h3>${story.title}</h3>
            <p>${story.summary}</p>
            <div class="story-meta">
                <span>🕐 ${story.duration}</span>
                <span>🎂 ${story.ageGroup}</span>
                <span>🗣️ ${story.language}</span>
            </div>
        </div>`
    ).join('');

    container.innerHTML = html;
}

// Lire une histoire
function readStory(storyId) {
    const story = storiesData.find(s => s.id === storyId);
    if (!story) return;

    showToast(`📚 "${story.title}" en cours de développement !`);
    trackEvent('story_selected', { storyId: storyId, title: story.title });
}

// Mettre à jour l'interface de progrès
function updateProgressInterface() {
    document.getElementById('totalQuiz').textContent = userData.quizCompleted;
    document.getElementById('totalContrib').textContent = userData.contributions;
    document.getElementById('totalPoints').textContent = userData.points;
}

// Initialiser les badges
function initializeBadges() {
    const badges = [
        { id: 'first_quiz', name: 'Premier Quiz', icon: '🎯', earned: userData.quizCompleted >= 1 },
        { id: 'quiz_master', name: 'Maître Quiz', icon: '🏆', earned: userData.quizCompleted >= 10 },
        { id: 'corpus_helper', name: 'Aide Corpus', icon: '💎', earned: userData.contributions >= 1 },
        { id: 'language_guardian', name: 'Gardien Langue', icon: '🌟', earned: userData.contributions >= 5 },
        { id: 'point_collector', name: 'Collectionneur', icon: '⭐', earned: userData.points >= 100 },
        { id: 'culture_expert', name: 'Expert Culture', icon: '🏛️', earned: userData.points >= 500 }
    ];

    const container = document.getElementById('badgesGrid');
    if (!container) return;

    const html = badges.map(badge =>
        `<div class="badge ${badge.earned ? 'earned' : ''}">
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
        </div>`
    ).join('');

    container.innerHTML = html;
}

// Changer de langue
function changeLanguage(langCode) {
    // Mettre à jour les boutons
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-lang="${langCode}"]`).classList.add('active');

    // Simulation du changement de langue
    const translations = {
        'gcr': {
            title: 'Ti Moun Savoir AI',
            subtitle: 'Aprann ak kilti Gwiyanè'
        },
        'fr': {
            title: 'Ti Moun Savoir AI',
            subtitle: 'Apprendre avec la culture guyanaise'
        }
    };

    const translation = translations[langCode] || translations['fr'];
    document.querySelector('.app-header h1').textContent = `🌟 ${translation.title}`;
    document.querySelector('.app-header p').textContent = translation.subtitle;

    trackEvent('language_changed', { language: langCode });
    showToast(`🌍 Langue changée : ${langCode.toUpperCase()}`);
}

// Gestion des données utilisateur
function loadUserData() {
    const saved = localStorage.getItem('tiMounUserData');
    if (saved) {
        userData = { ...userData, ...JSON.parse(saved) };
    }
    updateUserDisplay();
}

function saveUserData() {
    localStorage.setItem('tiMounUserData', JSON.stringify(userData));
}

function updateUserDisplay() {
    document.getElementById('userPoints').textContent = userData.points;
    document.getElementById('userQuiz').textContent = userData.quizCompleted;
    document.getElementById('userContrib').textContent = userData.contributions;
}

// Statut de connexion
function updateConnectionStatus() {
    const status = document.getElementById('connectionStatus');
    if (navigator.onLine) {
        status.textContent = '🟢 En ligne';
        status.style.background = 'rgba(46, 204, 113, 0.2)';
    } else {
        status.textContent = '🔴 Hors ligne';
        status.style.background = 'rgba(231, 76, 60, 0.2)';
    }
}

// Système de notifications toast
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toastMessage');

    messageEl.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// Analytics simple
function trackEvent(eventName, data = {}) {
    const event = {
        name: eventName,
        data: data,
        timestamp: new Date().toISOString(),
        user: userData.name,
        platform: 'pwa'
    };

    // Sauvegarder dans localStorage pour démo
    let events = JSON.parse(localStorage.getItem('tiMounEvents') || '[]');
    events.push(event);

    // Garder seulement les 100 derniers
    if (events.length > 100) {
        events = events.slice(-100);
    }

    localStorage.setItem('tiMounEvents', JSON.stringify(events));
    console.log('📊 Event:', eventName, data);
}

// Gestion des gestes tactiles
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipeGesture();
}, { passive: true });

function handleSwipeGesture() {
    const swipeThreshold = 100;
    const diff = touchStartY - touchEndY;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe vers le haut - scroll vers le haut
            console.log('Swipe up detected');
        } else {
            // Swipe vers le bas - scroll vers le bas ou actualiser
            console.log('Swipe down detected');
            if (window.scrollY === 0) {
                // Pull to refresh simulation
                showToast('🔄 Actualisation...');
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        }
    }
}

// Gestion de l'état de l'application
function handleVisibilityChange() {
    if (document.hidden) {
        // App mise en arrière-plan
        saveUserData();
        trackEvent('app_backgrounded');
    } else {
        // App remise au premier plan
        trackEvent('app_foregrounded');
        updateConnectionStatus();
    }
}

document.addEventListener('visibilitychange', handleVisibilityChange);

// Gestion des erreurs
window.addEventListener('error', function(e) {
    console.error('Erreur JS:', e.error);
    trackEvent('javascript_error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno
    });
    showToast('⚠️ Une erreur est survenue');
});

// Sauvegarder avant fermeture
window.addEventListener('beforeunload', function() {
    saveUserData();
    trackEvent('app_closed');
});

// Fonctions utilitaires
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Optimisations performance
const debouncedSave = debounce(saveUserData, 1000);
const throttledTrack = throttle(trackEvent, 500);

// Mise à jour périodique des données
setInterval(() => {
    if (navigator.onLine) {
        // Simuler la synchronisation avec le serveur
        console.log('🔄 Sync simulation...');
    }
}, 60000); // Toutes les minutes

// Fonctions pour les boutons de résultats
function restartQuiz() {
    currentQuestion = 0;
    quizScore = 0;
    document.querySelector('.question-card').classList.remove('hidden');
    document.getElementById('quizResults').classList.add('hidden');
    showQuestion();
    trackEvent('quiz_restarted');
}

function showMenu() {
    handleNavigation('menu');
}

// Initialisation des données de démonstration
function initializeDemoData() {
    // Ajouter des données de démonstration si nécessaire
    const demoContributions = [
        { french: "Comment allez-vous ?", local: "Ki jan ou yé ?", language: "Créole Guyanais", contributor: "Grand-mère Anne" },
        { french: "À bientôt", local: "A talè", language: "Créole Guyanais", contributor: "Papa Michel" },
        { french: "Bonne nuit", local: "Bon nuit", language: "Créole Guyanais", contributor: "Maman Sarah" }
    ];

    // Fusionner avec les contributions existantes si aucune n'existe
    if (contributionsData.length <= 3) {
        contributionsData = [...contributionsData, ...demoContributions];
    }
}

// Simulation d'API pour le mode hors ligne
class OfflineAPI {
    static saveContribution(contribution) {
        let offlineQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        offlineQueue.push({
            type: 'contribution',
            data: contribution,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue));
    }

    static processOfflineQueue() {
        const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        if (queue.length > 0 && navigator.onLine) {
            // Simuler l'envoi au serveur
            console.log('📤 Processing offline queue:', queue.length, 'items');
            localStorage.removeItem('offlineQueue');
            showToast(`📤 ${queue.length} actions synchronisées !`);
        }
    }
}

// Vérifier et traiter la queue hors ligne au démarrage
window.addEventListener('online', () => {
    OfflineAPI.processOfflineQueue();
});

// Initialiser les données de démo
initializeDemoData();

// Logs de démarrage
console.log('🌟 Ti Moun Savoir AI PWA prêt !');
console.log('📱 Fonctionnalités:', {
    'Service Worker': 'serviceWorker' in navigator,
    'Notifications': 'Notification' in window,
    'Vibration': 'vibrate' in navigator,
    'Géolocalisation': 'geolocation' in navigator,
    'Storage': 'localStorage' in window
});

// Export des fonctions globales nécessaires
window.TiMounApp = {
    trackEvent,
    showToast,
    saveUserData,
    userData,
    restartQuiz,
    showMenu,
    readStory,
    startQuiz
};