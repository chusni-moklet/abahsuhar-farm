/**
 * Auth Module - Abah Suhar Farm Finance
 * Handles login, logout, session management
 */

const Auth = (() => {
  const SESSION_KEY = 'farm_session';
  const REMEMBER_KEY = 'farm_remember';

  // Default admin credentials
  const ADMIN_CREDENTIALS = {
    email: 'abahsuhar@gmail.com',
    password: 'suharsaroh87',
    role: 'admin',
    name: 'Abah Suhar'
  };

  /**
   * Login function - validates credentials
   * In production, this calls the Google Apps Script API
   */
  const login = async (email, password, remember = false) => {
    try {
      // Try API login first
      const apiUrl = window.APP_CONFIG?.API_URL;
      if (apiUrl) {
        const response = await fetch(`${apiUrl}?action=login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
          _saveSession(data.user, remember);
          return { success: true, user: data.user };
        }
        return { success: false, message: data.message };
      }
    } catch (e) {
      // Fallback to local credentials if API not configured
    }

    // Local credential check (fallback / demo mode)
    if (
      email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const user = {
        email: ADMIN_CREDENTIALS.email,
        role: ADMIN_CREDENTIALS.role,
        name: ADMIN_CREDENTIALS.name,
        loginTime: new Date().toISOString()
      };
      _saveSession(user, remember);
      return { success: true, user };
    }

    return { success: false, message: 'Email atau password salah' };
  };

  /**
   * Save session to localStorage
   */
  const _saveSession = (user, remember) => {
    const session = {
      user,
      expires: remember
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        : new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString() // 8 hours
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    if (remember) localStorage.setItem(REMEMBER_KEY, 'true');
  };

  /**
   * Get current session
   */
  const getSession = () => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (new Date(session.expires) < new Date()) {
        logout();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  };

  /**
   * Get current user
   */
  const getUser = () => {
    const session = getSession();
    return session ? session.user : null;
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return getSession() !== null;
  };

  /**
   * Logout - clear session
   */
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  };

  /**
   * Protect page - redirect to login if not authenticated
   */
  const requireAuth = () => {
    if (!isAuthenticated()) {
      window.location.href = '../login.html';
      return false;
    }
    return true;
  };

  /**
   * Protect page from root level
   */
  const requireAuthRoot = () => {
    if (!isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  };

  return { login, logout, getSession, getUser, isAuthenticated, requireAuth, requireAuthRoot };
})();

// Make available globally
window.Auth = Auth;
