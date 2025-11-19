/* --- admin.js (LÓGICA DEL DASHBOARD DE ADMIN) --- */

let ALL_USERS_DATA = [];
const INACTIVITY_THRESHOLD_DAYS = 2;

window.onload = function() {
    // 1. Verificar si el usuario actual es Admin antes de cargar la página
    if (typeof UserManager === 'undefined' || !UserManager.isCurrentUserAdmin || !UserManager.isCurrentUserAdmin()) {
        alert("Acceso denegado. Solo Super Admin.");
        window.location.href = 'Login.html';
        return;
    }

    // 2. Cargar y procesar todos los datos
    loadAdminDashboard();

    // 3. Configurar listeners
    document.getElementById('searchInput')?.addEventListener('input', filterUsers);

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterUsers();
        });
    });
};

function loadAdminDashboard() {
    const usersObject = UserManager.getAllUsersData();
    
    // Mapear el objeto de usuarios a un array, omitir Admin y procesar la actividad.
    ALL_USERS_DATA = Object.keys(usersObject)
        .filter(username => !usersObject[username].isAdmin)
        .map(username => {
            const user = usersObject[username];
            
            const lastVisitISO = user.lastVisit || new Date(0).toISOString();
            const lastVisitDate = new Date(lastVisitISO);
            const today = new Date();

            const timeDiff = today.getTime() - lastVisitDate.getTime();
            const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
            
            // Si la diferencia de días es 0 o menor que el umbral, se considera activo.
            const isActive = daysDiff <= INACTIVITY_THRESHOLD_DAYS;

            return {
                ...user,
                username: username, // CLAVE: Adjuntar el username para referencia y búsqueda
                isActive: isActive,
                daysSinceLastVisit: daysDiff
            };
        });

    updateHeaderStats(ALL_USERS_DATA);
    filterUsers(); // Muestra el filtro 'Todos' por defecto
}

function updateHeaderStats(users) {
    const totalCount = users.length;
    const activeCount = users.filter(user => user.isActive).length;

    document.getElementById('userCount').textContent = totalCount;
    document.getElementById('activeCount').textContent = activeCount;

    if (totalCount === 0) {
        document.getElementById('userList').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
    } else {
        document.getElementById('userList').style.display = 'grid';
        document.getElementById('emptyState').style.display = 'none';
    }
}

function renderUserList(usersToRender) {
    const userListContainer = document.getElementById('userList');
    userListContainer.innerHTML = '';

    if (usersToRender.length === 0) {
        document.getElementById('userList').style.display = 'none';
        document.getElementById('emptyState').style.display = 'block';
        document.querySelector('#emptyState h3').textContent = 'No se encontraron resultados';
        document.querySelector('#emptyState p').textContent = 'Intenta con otros criterios de búsqueda o filtro.';
        return;
    }
    
    document.getElementById('userList').style.display = 'grid';
    document.getElementById('emptyState').style.display = 'none';
    
    usersToRender.forEach(user => {
        const card = createUserCard(user);
        userListContainer.appendChild(card);
    });
}

function createUserCard(user) {
    const stats = user.stats || {};
    
    // Mejorar la robustez al acceder al nombre y email
    const userName = (user.profile && user.profile.name) ? user.profile.name : user.username; 
    const userEmail = (user.profile && user.profile.email) ? user.profile.email : user.email || user.username;

    const totalScore = (stats.messagesCount || 0) + (stats.quizzesCompleted * 10) + (stats.challengesCompleted * 10);
    const maxScore = 150; 
    const progress = Math.min(Math.round((totalScore / maxScore) * 100), 100);
    
    const statusBadge = user.isActive 
        ? `<span class="badge active">Activo</span>`
        : `<span class="badge inactive">Inactivo (${user.daysSinceLastVisit} días)</span>`;
    
    const avatarLetter = userName.charAt(0).toUpperCase();

    const card = document.createElement('div');
    card.className = 'user-card';
    card.setAttribute('onclick', `viewDetailedProgress('${user.username}')`);
    card.innerHTML = `
        <div class="user-header">
            <div class="user-avatar">${avatarLetter}</div>
            <div class="user-info">
                <h3>${userName}</h3>
                <p class="user-email">${userEmail}</p>
                ${statusBadge}
            </div>
        </div>
        <div class="user-stats">
            <div class="stat-item">
                <span class="stat-item-value">${stats.messagesCount || 0}</span>
                <span class="stat-item-label">Msjs Enviados</span>
            </div>
            <div class="stat-item">
                <span class="stat-item-value">${stats.daysStreak || 0}</span>
                <span class="stat-item-label">Días de Racha 🔥</span>
            </div>
            <div class="stat-item">
                <span class="stat-item-value">${stats.quizzesCompleted || 0}</span>
                <span class="stat-item-label">Tests Comp.</span>
            </div>
            <div class="stat-item">
                <span class="stat-item-value">${stats.challengesCompleted || 0}</span>
                <span class="stat-item-label">Desafíos Comp.</span>
            </div>
        </div>
        <div class="progress-section">
            <div class="progress-label">
                <span>Progreso General</span>
                <span class="progress-percentage">${progress}%</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
        </div>
    `;
    return card;
}

function filterUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    // Obtener el filtro activo correctamente (debe tener la clase 'active')
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';


    const filteredUsers = ALL_USERS_DATA.filter(user => {
        // Mejorar la robustez al acceder al nombre y email para la búsqueda
        const userName = (user.profile && user.profile.name) ? user.profile.name.toLowerCase() : user.username.toLowerCase();
        const userEmail = (user.profile && user.profile.email) ? user.profile.email.toLowerCase() : (user.email || '').toLowerCase();
        
        const matchesSearch = userName.includes(searchTerm) || userEmail.includes(searchTerm) || user.username.toLowerCase().includes(searchTerm);
        
        let matchesFilter = true;
        if (activeFilter === 'active') {
            matchesFilter = user.isActive;
        } else if (activeFilter === 'inactive') {
            matchesFilter = !user.isActive;
        }
        
        return matchesSearch && matchesFilter;
    });

    renderUserList(filteredUsers);
}
// FUNCIÓN PARA CREAR USUARIOS INACTIVOS DE PRUEBA
window.createTestInactiveUsers = function() {
    const users = UserManager.getAllUsers();
    
    // Crear usuario inactivo hace 10 días
    const date10DaysAgo = new Date();
    date10DaysAgo.setDate(date10DaysAgo.getDate() - 10);
    
    users['maria_inactiva'] = {
        password: 'test123',
        profile: {
            name: 'María Pérez',
            email: 'maria.inactiva@test.com',
            registeredDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        stats: { 
            messagesCount: 5, 
            quizzesCompleted: 1, 
            challengesCompleted: 0, 
            daysStreak: 0, 
            playlistsListened: 2 
        },
        challenges: [],
        conversationHistory: [],
        lastVisit: date10DaysAgo.toISOString(),
        isAdmin: false
    };
    
 
    const date15DaysAgo = new Date();
    date15DaysAgo.setDate(date15DaysAgo.getDate() - 15);
    
    users['carlos_inactivo'] = {
        password: 'test123',
        profile: {
            name: 'Carlos Gómez',
            email: 'carlos.inactivo@test.com',
            registeredDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        stats: { 
            messagesCount: 0, 
            quizzesCompleted: 0, 
            challengesCompleted: 0, 
            daysStreak: 0, 
            playlistsListened: 0 
        },
        challenges: [],
        conversationHistory: [],
        lastVisit: date15DaysAgo.toISOString(),
        isAdmin: false
    };
    
    // Crear usuario activo para comparación
    users['ana_activa'] = {
        password: 'test123',
        profile: {
            name: 'Ana López',
            email: 'ana.activa@test.com',
            registeredDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        },
        stats: { 
            messagesCount: 20, 
            quizzesCompleted: 3, 
            challengesCompleted: 2, 
            daysStreak: 5, 
            playlistsListened: 8 
        },
        challenges: [],
        conversationHistory: [],
        lastVisit: new Date().toISOString(),
        isAdmin: false
    };
    
    UserManager.saveAllUsers(users);
    alert('✅ Se crearon 3 usuarios de prueba:\n\n' +
          '👤 María Pérez - Inactiva (10 días)\n' +
          '👤 Carlos Gómez - Inactivo (15 días)\n' +
          '👤 Ana López - Activa (visitó hoy)\n\n' +
          'Ahora puedes probar los filtros.');
    
    loadAdminDashboard();
};


document.getElementById('createTestUsersBtn')?.addEventListener('click', window.createTestInactiveUsers);
function viewDetailedProgress(username) {
    const user = ALL_USERS_DATA.find(u => u.username === username);
    
    if (!user) {
        alert(`Error: Usuario ${username} no encontrado.`);
        return;
    }
    
    const stats = user.stats || {};
    const challenges = user.challenges || [];

    const userNameDisplay = user.profile ? user.profile.name : user.username;
    
    let detailsHTML = `
        
        Detalles de Progreso: ${userNameDisplay}
        ------------------------------------------
        Racha de Días: ${stats.daysStreak || 0} 🔥
        Playlists Escuchadas: ${stats.playlistsListened || 0} 🎵
        Última Visita: ${new Date(user.lastVisit).toLocaleDateString()}
        
        Desafíos Activos/Completados:
        
        ${challenges.map(c => `
        - ${c.title}: ${c.status === 'completed' ? '✅ Completado' : `${c.progress}/${c.target} Activo`}
        `).join('')}
        
        *El historial de chat y respuestas de tests no se muestra por privacidad/complejidad de datos.
    `;

    alert(detailsHTML);

    
}