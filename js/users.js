// users.js - Sistema de gestión de usuarios (CONSOLIDADO Y CORREGIDO)

const UserManager = {

    USER_STORAGE_KEY: 'MenteSerenaUsers',
    CURRENT_USER_KEY: 'menteSerena_currentUser',

    getAllUsers() {
        const usersString = localStorage.getItem(this.USER_STORAGE_KEY);
        if (!usersString) {
            return {};
        }

        try {
            return JSON.parse(usersString);
        } catch (error) {
            console.error("Error al parsear datos de usuarios de localStorage:", error);
            return {};
        }
    },

    saveAllUsers(users) {
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(users));
    },

    getUserData(username) {
        const users = this.getAllUsers();
        return users[username] || null;
    },

    initializeAdminUser() {
        const ADMIN_USERNAME = "superadmin";
        const ADMIN_PASSWORD = "Admin1234";

        let users = this.getAllUsers();

        if (!users[ADMIN_USERNAME]) {
            console.log(`Creando usuario Super Admin: ${ADMIN_USERNAME}`);

            users[ADMIN_USERNAME] = {
                password: ADMIN_PASSWORD,
                email: "admin@menteserena.com",
                isAdmin: true,
                lastVisit: new Date().toISOString(),
                stats: { messagesCount: 0, quizzesCompleted: 0, challengesCompleted: 0, daysStreak: 0, playlistsListened: 0 },
                challenges: [],
                conversationHistory: []
            };

            this.saveAllUsers(users);
        }
    },

    getAllUsersData() {
        return this.getAllUsers();
    },

    register(username, password, email, fullname) {
        const users = this.getAllUsers();

        if (users[username]) {
            return { success: false, message: 'El usuario ya existe' };
        }

        const nowISO = new Date().toISOString();

        users[username] = {
            password: password,
            profile: {
                name: fullname,
                email: email,
                registeredDate: nowISO
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
            lastVisit: nowISO,
            isAdmin: false
        };

        this.saveAllUsers(users);
        return { success: true, message: 'Usuario registrado exitosamente' };
    },

    login(username, password) {
        const user = this.getUserData(username);

        if (!user) {
            return { success: false, message: 'Usuario no encontrado' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Contraseña incorrecta' };
        }

        localStorage.setItem(this.CURRENT_USER_KEY, username);
        return { success: true, message: 'Login exitoso' };
    },

    getCurrentUser() {
        return localStorage.getItem(this.CURRENT_USER_KEY);
    },

    getCurrentUserData() {
        const username = this.getCurrentUser();
        if (!username) return null;

        return this.getUserData(username);
    },

    saveCurrentUserData(data) {
        const username = this.getCurrentUser();
        if (!username) return false;

        const users = this.getAllUsers();

        if (!users[username]) return false;

        users[username] = { ...users[username], ...data };
        this.saveAllUsers(users);
        return true;
    },

    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    },

    isCurrentUserAdmin() {
        const userData = this.getCurrentUserData();
        return userData && userData.isAdmin === true;
    }
};

UserManager.initializeAdminUser();