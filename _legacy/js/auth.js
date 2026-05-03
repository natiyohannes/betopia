/**
 * Mock Authentication System
 * Uses localStorage to simulate a database of users and a session.
 */

const Auth = {
    // Keys for localStorage
    USERS_KEY: 'betoch_users',
    SESSION_KEY: 'betoch_current_user',

    /**
     * Register a new user
     * @param {Object} user { name, email, password, phone }
     * @returns {Object} result { success: boolean, message: string }
     */
    register: function (user) {
        const users = this.getUsers();

        // Check if email already exists
        if (users.find(u => u.email === user.email)) {
            return { success: false, message: 'Email already registered' };
        }

        users.push(user);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

        // Auto login after register
        this.login(user.email, user.password);

        return { success: true, message: 'Registration successful' };
    },

    /**
     * Login a user
     * @param {string} email 
     * @param {string} password 
     * @returns {Object} result { success: boolean, message: string }
     */
    login: function (email, password) {
        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Store session (exclude password)
            const { password, ...safeUser } = user;
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(safeUser));
            return { success: true, message: 'Login successful' };
        }

        return { success: false, message: 'Invalid email or password' };
    },

    /**
     * Logout current user
     */
    logout: function () {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'home.html';
    },

    /**
     * Get current logged in user
     * @returns {Object|null}
     */
    getCurrentUser: function () {
        const userStr = localStorage.getItem(this.SESSION_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Get all registered users
     * @returns {Array}
     */
    getUsers: function () {
        const usersStr = localStorage.getItem(this.USERS_KEY);
        return usersStr ? JSON.parse(usersStr) : [];
    },

    /**
     * Check if user is logged in, redirect if not
     */
    requireAuth: function () {
        if (!this.getCurrentUser()) {
            window.location.href = 'login.html';
        }
    },

    /**
     * Update UI based on auth state
     * call this on page load to update nav bars etc
     */
    initUI: function () {
        const user = this.getCurrentUser();
        const authContainer = document.getElementById('auth-nav-container');

        if (!authContainer) return;

        if (user) {
            authContainer.innerHTML = `
                <span class="text-indigo-200 mr-4">Welcome, ${user.name}</span>
                <button onclick="Auth.logout()" class="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium">Logout</button>
            `;
        } else {
            authContainer.innerHTML = `
                <a href="login.html" class="text-white hover:text-indigo-200 px-3 py-2 rounded-md text-sm font-medium">Login</a>
                <a href="signup.html" class="bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-600 transition duration-300 ml-2">Sign Up</a>
            `;
        }
    }
};

// Make accessible globally
window.Auth = Auth;
