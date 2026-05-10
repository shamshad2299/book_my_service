const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const sessionStore = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      this.clear();
      return null;
    }
  },

  save({ token, user }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

