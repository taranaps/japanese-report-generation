
import { checkAuth, logout } from './auth.js';

// Check authentication status
checkAuth();

// Attach logout function to the logout button
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.logout').addEventListener('click', logout);
});
