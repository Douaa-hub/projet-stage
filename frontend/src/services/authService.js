// authService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/auth';

export async function login(email, motDePasse) {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      mot_de_passe: motDePasse,
    });

    const data = response.data;

    if (data.success && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } else {
      return { success: false, message: data.message || 'Pas de token reçu.' };
    }
  } catch (error) {
    const msg = error.response?.data?.error || 'Erreur serveur ou réseau';
    return { success: false, message: msg };
  }
}

export function getUser() {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Redirection vers la page login gérée dans DashboardEmploye avec React Router
}





