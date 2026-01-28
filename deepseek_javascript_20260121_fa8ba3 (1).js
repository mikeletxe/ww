// Datos de ejemplo para la aplicación
const sampleRides = [
    {
        id: 1,
        from: "MAD",
        fromName: "Aeropuerto Madrid-Barajas",
        to: "Centro de Madrid",
        destination: "Plaza Mayor, Madrid",
        time: "2023-10-15T15:30:00",
        passengers: 1,
        maxPassengers: 4,
        luggage: "medium",
        price: 12.50,
        users: [
            { name: "Carlos M", avatar: "https://ui-avatars.com/api/?name=Carlos+M" },
            { name: "Ana G", avatar: "https://ui-avatars.com/api/?name=Ana+G" }
        ],
        coordinates: { lat: 40.4168, lng: -3.7038 }
    },
    {
        id: 2,
        from: "BCN",
        fromName: "Aeropuerto Barcelona-El Prat",
        to: "Diagonal",
        destination: "Avenida Diagonal, 123, Barcelona",
        time: "2023-10-15T16:45:00",
        passengers: 2,
        maxPassengers: 3,
        luggage: "light",
        price: 15.00,
        users: [
            { name: "Laura S", avatar: "https://ui-avatars.com/api/?name=Laura+S" }
        ],
        coordinates: { lat: 41.3851, lng: 2.1734 }
    },
    {
        id: 3,
        from: "AGP",
        fromName: "Aeropuerto Málaga-Costa del Sol",
        to: "Málaga Centro",
        destination: "Calle Larios, Málaga",
        time: "2023-10-15T17:20:00",
        passengers: 1,
        maxPassengers: 4,
        luggage: "heavy",
        price: 10.00,
        users: [
            { name: "Miguel R", avatar: "https://ui-avatars.com/api/?name=Miguel+R" },
            { name: "Sofía L", avatar: "https://ui-avatars.com/api/?name=Sofia+L" },
            { name: "Jorge P", avatar: "https://ui-avatars.com/api/?name=Jorge+P" }
        ],
        coordinates: { lat: 36.7194, lng: -4.4200 }
    },
    {
        id: 4,
        from: "MAD",
        fromName: "Aeropuerto Madrid-Barajas",
        to: "Barrio Salamanca",
        destination: "Calle Serrano, Madrid",
        time: "2023-10-15T18:00:00",
        passengers: 3,
        maxPassengers: 4,
        luggage: "medium",
        price: 14.00,
        users: [
            { name: "Elena V", avatar: "https://ui-avatars.com/api/?name=Elena+V" }
        ],
        coordinates: { lat: 40.4260, lng: -3.6850 }
    }
];

// Estado de la aplicación
let appState = {
    user: null,
    rides: sampleRides,
    currentRide: null,
    map: null,
    markers: []
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar elementos de UI
    initUI();
    
    // Cargar viajes en la lista
    loadRides();
    
    // Inicializar mapa
    initMap();
    
    // Comprobar si hay un usuario en localStorage
    checkLoggedInUser();
    
    // Configurar eventos
    setupEventListeners();
});

// Inicializar interfaz de usuario
function initUI() {
    // Configurar menú móvil
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.nav-menu');
    
    mobileMenuBtn.addEventListener('click', function() {
        navMenu.classList.toggle('active');
    });
    
    // Cerrar menú móvil al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });
}

// Cargar viajes en la lista
function loadRides(filter = '') {
    const ridesList = document.getElementById('ridesList');
    ridesList.innerHTML = '';
    
    let filteredRides = appState.rides;
    
    // Aplicar filtro si existe
    if (filter) {
        const searchTerm = filter.toLowerCase();
        filteredRides = appState.rides.filter(ride => 
            ride.to.toLowerCase().includes(searchTerm) || 
            ride.fromName.toLowerCase().includes(searchTerm) ||
            ride.destination.toLowerCase().includes(searchTerm)
        );
    }
    
    // Crear tarjetas para cada viaje
    filteredRides.forEach(ride => {
        const rideCard = createRideCard(ride);
        ridesList.appendChild(rideCard);
    });
    
    // Actualizar marcadores en el mapa
    updateMapMarkers(filteredRides);
}

// Crear tarjeta de viaje
function createRideCard(ride) {
    const card = document.createElement('div');
    card.className = 'ride-card';
    card.dataset.id = ride.id;
    
    // Formatear la hora
    const rideTime = new Date(ride.time);
    const formattedTime = rideTime.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const formattedDate = rideTime.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
    
    // Crear usuarios
    let usersHTML = '';
    ride.users.forEach(user => {
        usersHTML += `<img src="${user.avatar}" alt="${user.name}" class="ride-user" title="${user.name}">`;
    });
    
    // Espacios disponibles
    const availableSpots = ride.maxPassengers - ride.passengers;
    
    card.innerHTML = `
        <div class="ride-header">
            <h3 class="ride-title">De ${ride.from} a ${ride.to}</h3>
            <span class="ride-time">${formattedTime}</span>
        </div>
        <div class="ride-details">
            <div><i class="fas fa-map-marker-alt"></i> ${ride.destination}</div>
            <div><i class="fas fa-users"></i> ${ride.passengers}/${ride.maxPassengers} pasajeros</div>
        </div>
        <div class="ride-footer">
            <div class="ride-users">${usersHTML}</div>
            <div class="ride-price">${ride.price.toFixed(2)}€/pers</div>
        </div>
        <div class="ride-actions">
            <button class="btn-primary btn-join-ride" data-id="${ride.id}">
                <i class="fas fa-user-plus"></i> Unirme al viaje
            </button>
        </div>
    `;
    
    // Agregar evento al botón de unirse
    const joinBtn = card.querySelector('.btn-join-ride');
    joinBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        joinRide(ride.id);
    });
    
    // Agregar evento a la tarjeta completa
    card.addEventListener('click', function() {
        showRideDetails(ride.id);
    });
    
    return card;
}

// Inicializar mapa
function initMap() {
    // Coordenadas centrales de España
    const center = [40.4168, -3.7038];
    
    // Crear mapa
    appState.map = L.map('map').setView(center, 6);
    
    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(appState.map);
    
    // Agregar marcadores para los viajes
    updateMapMarkers(appState.rides);
}

// Actualizar marcadores en el mapa
function updateMapMarkers(rides) {
    // Limpiar marcadores anteriores
    appState.markers.forEach(marker => {
        appState.map.removeLayer(marker);
    });
    appState.markers = [];
    
    // Agregar nuevos marcadores
    rides.forEach(ride => {
        const marker = L.marker(ride.coordinates).addTo(appState.map);
        
        // Configurar popup
        const popupContent = `
            <div class="map-popup">
                <h4>De ${ride.from} a ${ride.to}</h4>
                <p><strong>Destino:</strong> ${ride.destination}</p>
                <p><strong>Hora:</strong> ${new Date(ride.time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>Precio:</strong> ${ride.price.toFixed(2)}€ por persona</p>
                <button class="btn-primary btn-map-join" data-id="${ride.id}">Unirse</button>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Agregar evento al botón dentro del popup
        marker.on('popupopen', function() {
            const joinBtn = document.querySelector(`.btn-map-join[data-id="${ride.id}"]`);
            if (joinBtn) {
                joinBtn.addEventListener('click', function() {
                    joinRide(ride.id);
                });
            }
        });
        
        appState.markers.push(marker);
    });
    
    // Ajustar vista del mapa si hay marcadores
    if (rides.length > 0) {
        const group = new L.featureGroup(appState.markers);
        appState.map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Botón de crear viaje
    const createJourneyBtn = document.getElementById('createJourneyBtn');
    createJourneyBtn.addEventListener('click', function() {
        createNewJourney();
    });
    
    // Botones de inicio rápido
    const startJourneyBtn = document.getElementById('startJourneyBtn');
    startJourneyBtn.addEventListener('click', function() {
        document.getElementById('create').scrollIntoView({ behavior: 'smooth' });
    });
    
    const findRidesBtn = document.getElementById('findRidesBtn');
    findRidesBtn.addEventListener('click', function() {
        document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Búsqueda de viajes
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        loadRides(this.value);
    });
    
    // Botón de filtro
    const filterBtn = document.getElementById('filterBtn');
    filterBtn.addEventListener('click', function() {
        alert('Funcionalidad de filtro avanzado - En desarrollo');
    });
    
    // Login/Registro
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const authModal = document.getElementById('authModal');
    
    loginBtn.addEventListener('click', function() {
        showAuthModal('login');
    });
    
    registerBtn.addEventListener('click', function() {
        showAuthModal('register');
    });
    
    modalCloseBtn.addEventListener('click', function() {
        hideAuthModal();
    });
    
    authModal.addEventListener('click', function(e) {
        if (e.target === authModal) {
            hideAuthModal();
        }
    });
    
    // Tabs de autenticación
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchAuthTab(tabName);
        });
    });
    
    // Formularios de autenticación
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister();
    });
    
    // Botones de login social
    const googleBtn = document.querySelector('.btn-social.google');
    const appleBtn = document.querySelector('.btn-social.apple');
    
    googleBtn.addEventListener('click', function() {
        alert('Inicio de sesión con Google - En desarrollo');
    });
    
    appleBtn.addEventListener('click', function() {
        alert('Inicio de sesión con Apple - En desarrollo');
    });
    
    // Chat
    const closeChatBtn = document.getElementById('closeChatBtn');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const messageInput = document.getElementById('messageInput');
    
    closeChatBtn.addEventListener('click', function() {
        document.getElementById('chatSection').classList.add('hidden');
    });
    
    sendMessageBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Crear nuevo viaje
function createNewJourney() {
    const arrivalPoint = document.getElementById('arrivalPoint').value;
    const arrivalTime = document.getElementById('arrivalTime').value;
    const destination = document.getElementById('destination').value;
    const passengers = document.getElementById('passengers').value;
    const luggage = document.getElementById('luggage').value;
    
    // Validación básica
    if (!arrivalPoint || !arrivalTime || !destination) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
    }
    
    // Crear nuevo objeto de viaje
    const newRide = {
        id: appState.rides.length + 1,
        from: arrivalPoint,
        fromName: getAirportName(arrivalPoint),
        to: extractZone(destination),
        destination: destination,
        time: arrivalTime,
        passengers: 1, // El creador
        maxPassengers: 4,
        luggage: luggage,
        price: calculatePrice(arrivalPoint, destination),
        users: [
            { 
                name: appState.user ? appState.user.name : "Usuario Nuevo", 
                avatar: appState.user ? appState.user.avatar : "https://ui-avatars.com/api/?name=Usuario+Nuevo" 
            }
        ],
        coordinates: getRandomCoordinates(arrivalPoint)
    };
    
    // Agregar a la lista de viajes
    appState.rides.unshift(newRide);
    
    // Actualizar UI
    loadRides();
    
    // Mostrar confirmación
    alert(`¡Viaje creado exitosamente! Hemos encontrado ${findMatches(newRide).length} posibles compañeros.`);
    
    // Desplazar a la sección de búsqueda
    document.getElementById('search').scrollIntoView({ behavior: 'smooth' });
}

// Unirse a un viaje
function joinRide(rideId) {
    // Verificar si el usuario está logueado
    if (!appState.user) {
        alert('Debes iniciar sesión para unirte a un viaje');
        showAuthModal('login');
        return;
    }
    
    // Encontrar el viaje
    const ride = appState.rides.find(r => r.id === rideId);
    if (!ride) return;
    
    // Verificar si hay espacio
    if (ride.passengers >= ride.maxPassengers) {
        alert('Este viaje ya está completo');
        return;
    }
    
    // Agregar usuario al viaje
    ride.users.push({
        name: appState.user.name,
        avatar: appState.user.avatar
    });
    ride.passengers++;
    
    // Actualizar UI
    loadRides();
    
    // Mostrar chat
    appState.currentRide = ride;
    showChat(ride);
    
    // Mostrar confirmación
    alert(`Te has unido al viaje a ${ride.to}. ¡Buen viaje!`);
}

// Mostrar detalles del viaje
function showRideDetails(rideId) {
    const ride = appState.rides.find(r => r.id === rideId);
    if (!ride) return;
    
    // En una versión completa, abriría un modal con todos los detalles
    alert(`Detalles del viaje:\n\nDe: ${ride.fromName}\nA: ${ride.destination}\nHora: ${new Date(ride.time).toLocaleString()}\nPasajeros: ${ride.passengers}/${ride.maxPassengers}\nPrecio por persona: ${ride.price}€`);
}

// Mostrar chat
function showChat(ride) {
    const chatSection = document.getElementById('chatSection');
    const chatTripTitle = document.getElementById('chatTripTitle');
    const chatTripTime = document.getElementById('chatTripTime');
    const chatTripDestination = document.getElementById('chatTripDestination');
    const chatMembers = document.getElementById('chatMembers');
    const chatMessages = document.getElementById('chatMessages');
    
    // Actualizar información del viaje
    chatTripTitle.textContent = `Viaje a ${ride.to}`;
    chatTripTime.textContent = new Date(ride.time).toLocaleString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
    chatTripDestination.textContent = `Desde ${ride.fromName} a ${ride.destination}`;
    
    // Actualizar miembros
    chatMembers.innerHTML = '';
    ride.users.forEach(user => {
        const memberDiv = document.createElement('div');
        memberDiv.className = 'member';
        memberDiv.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}">
            <span>${user.name}${user.name === (appState.user?.name || "Usuario") ? ' (Tú)' : ''}</span>
        `;
        chatMembers.appendChild(memberDiv);
    });
    
    // Cargar mensajes de ejemplo
    chatMessages.innerHTML = '';
    const sampleMessages = [
        { text: '¡Hola a todos! ¿Nos encontramos en la parada de taxis?', sender: 'ride', time: '14:25' },
        { text: 'Hola, sí, estaré con una maleta negra', sender: 'user', time: '14:27' },
        { text: 'Perfecto, yo llevo una chaqueta roja', sender: 'ride', time: '14:28' },
        { text: '¿Alguien necesita parada intermedia?', sender: 'user', time: '14:30' }
    ];
    
    sampleMessages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${msg.sender === 'user' ? 'sent' : 'received'}`;
        messageDiv.innerHTML = `<p>${msg.text}</p><small>${msg.time}</small>`;
        chatMessages.appendChild(messageDiv);
    });
    
    // Hacer scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Mostrar sección de chat
    chatSection.classList.remove('hidden');
}

// Enviar mensaje en el chat
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const chatMessages = document.getElementById('chatMessages');
    
    const messageText = messageInput.value.trim();
    if (!messageText) return;
    
    // Crear elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message sent';
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `<p>${messageText}</p><small>${timeString}</small>`;
    chatMessages.appendChild(messageDiv);
    
    // Limpiar input
    messageInput.value = '';
    
    // Hacer scroll al final
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simular respuesta automática después de un tiempo
    setTimeout(() => {
        if (appState.currentRide) {
            const responses = [
                "¡Genial! Nos vemos allí",
                "Perfecto, yo ya estoy en camino",
                "¿A qué hora exactamente?",
                "¿Alguien más se une?"
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            
            const responseDiv = document.createElement('div');
            responseDiv.className = 'message received';
            responseDiv.innerHTML = `<p>${randomResponse}</p><small>${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</small>`;
            chatMessages.appendChild(responseDiv);
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }, 2000);
}

// Funciones de autenticación
function showAuthModal(tab) {
    const authModal = document.getElementById('authModal');
    authModal.classList.remove('hidden');
    switchAuthTab(tab);
}

function hideAuthModal() {
    const authModal = document.getElementById('authModal');
    authModal.classList.add('hidden');
}

function switchAuthTab(tabName) {
    // Actualizar tabs
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Actualizar formularios
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const modalTitle = document.getElementById('modalTitle');
    
    if (tabName === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        modalTitle.textContent = 'Iniciar Sesión';
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        modalTitle.textContent = 'Registrarse';
    }
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Validación básica
    if (!email || !password) {
        alert('Por favor, completa todos los campos');
        return;
    }
    
    // Simular login exitoso
    appState.user = {
        name: email.split('@')[0],
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}`
    };
    
    // Guardar en localStorage
    localStorage.setItem('shareRideUser', JSON.stringify(appState.user));
    
    // Actualizar UI
    updateUserUI();
    
    // Cerrar modal
    hideAuthModal();
    
    // Mostrar mensaje de bienvenida
    alert(`¡Bienvenido/a, ${appState.user.name}!`);
}

function handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    // Validación básica
    if (!name || !email || !password) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
    }
    
    // Simular registro exitoso
    appState.user = {
        name: name,
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
    };
    
    // Guardar en localStorage
    localStorage.setItem('shareRideUser', JSON.stringify(appState.user));
    
    // Actualizar UI
    updateUserUI();
    
    // Cerrar modal
    hideAuthModal();
    
    // Mostrar mensaje de bienvenida
    alert(`¡Cuenta creada exitosamente, ${appState.user.name}!`);
}

function checkLoggedInUser() {
    const storedUser = localStorage.getItem('shareRideUser');
    if (storedUser) {
        appState.user = JSON.parse(storedUser);
        updateUserUI();
    }
}

function updateUserUI() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    
    if (appState.user) {
        // Ocultar botones de login/registro
        loginBtn.classList.add('hidden');
        registerBtn.classList.add('hidden');
        
        // Mostrar menú de usuario
        userMenu.classList.remove('hidden');
        userName.textContent = appState.user.name;
        
        // Actualizar avatar
        const userAvatar = userMenu.querySelector('.user-avatar');
        userAvatar.src = appState.user.avatar;
        
        // Agregar funcionalidad de logout
        userMenu.addEventListener('click', function() {
            const confirmLogout = confirm(`¿Cerrar sesión, ${appState.user.name}?`);
            if (confirmLogout) {
                logout();
            }
        });
    } else {
        // Mostrar botones de login/registro
        loginBtn.classList.remove('hidden');
        registerBtn.classList.remove('hidden');
        
        // Ocultar menú de usuario
        userMenu.classList.add('hidden');
    }
}

function logout() {
    appState.user = null;
    localStorage.removeItem('shareRideUser');
    updateUserUI();
    alert('Has cerrado sesión correctamente');
}

// Funciones auxiliares
function getAirportName(code) {
    const airports = {
        'MAD': 'Aeropuerto Madrid-Barajas',
        'BCN': 'Aeropuerto Barcelona-El Prat',
        'AGP': 'Aeropuerto Málaga-Costa del Sol',
        'PMI': 'Aeropuerto Palma de Mallorca',
        'SVQ': 'Aeropuerto Sevilla',
        'VLC': 'Aeropuerto Valencia'
    };
    return airports[code] || `Aeropuerto ${code}`;
}

function extractZone(destination) {
    // Extraer la zona principal de la dirección
    if (destination.toLowerCase().includes('centro') || destination.toLowerCase().includes('plaza')) {
        return 'Centro';
    } else if (destination.toLowerCase().includes('avenida') || destination.toLowerCase().includes('av.')) {
        return 'Avenida Principal';
    } else if (destination.toLowerCase().includes('hotel')) {
        return 'Zona Hotelera';
    } else {
        return 'Destino';
    }
}

function calculatePrice(from, destination) {
    // Precios simulados según aeropuerto y destino
    const basePrices = {
        'MAD': { 'Centro': 12.50, 'Avenida Principal': 15.00, 'Zona Hotelera': 14.00, 'Destino': 13.50 },
        'BCN': { 'Centro': 15.00, 'Avenida Principal': 18.00, 'Zona Hotelera': 16.50, 'Destino': 17.00 },
        'AGP': { 'Centro': 10.00, 'Avenida Principal': 12.00, 'Zona Hotelera': 11.50, 'Destino': 11.00 },
        'PMI': { 'Centro': 8.50, 'Avenida Principal': 10.00, 'Zona Hotelera': 9.50, 'Destino': 9.00 },
        'SVQ': { 'Centro': 9.00, 'Avenida Principal': 11.00, 'Zona Hotelera': 10.50, 'Destino': 10.00 },
        'VLC': { 'Centro': 7.50, 'Avenida Principal': 9.00, 'Zona Hotelera': 8.50, 'Destino': 8.00 }
    };
    
    const zone = extractZone(destination);
    return basePrices[from]?.[zone] || 10.00;
}

function getRandomCoordinates(airportCode) {
    // Coordenadas aproximadas de los aeropuertos
    const airportCoordinates = {
        'MAD': { lat: 40.4936, lng: -3.5668 },
        'BCN': { lat: 41.2974, lng: 2.0833 },
        'AGP': { lat: 36.6752, lng: -4.4991 },
        'PMI': { lat: 39.5499, lng: 2.7388 },
        'SVQ': { lat: 37.4212, lng: -5.8931 },
        'VLC': { lat: 39.4893, lng: -0.4815 }
    };
    
    const base = airportCoordinates[airportCode] || { lat: 40.4168, lng: -3.7038 };
    
    // Agregar pequeña variación aleatoria
    return {
        lat: base.lat + (Math.random() * 0.1 - 0.05),
        lng: base.lng + (Math.random() * 0.1 - 0.05)
    };
}

function findMatches(newRide) {
    // Algoritmo simple de emparejamiento
    return appState.rides.filter(ride => {
        // Mismo aeropuerto
        if (ride.from !== newRide.from) return false;
        
        // Misma zona de destino (simplificado)
        if (ride.to !== newRide.to) return false;
        
        // Misma franja horaria (±30 minutos)
        const newTime = new Date(newRide.time).getTime();
        const rideTime = new Date(ride.time).getTime();
        const timeDiff = Math.abs(newTime - rideTime) / (1000 * 60); // Diferencia en minutos
        
        return timeDiff <= 30;
    });
}