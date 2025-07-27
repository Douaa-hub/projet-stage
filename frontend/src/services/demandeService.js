import axios from 'axios';
import { getToken, getUser } from './authService';

const API_URL = 'http://localhost:3000/demandesortie';

export async function envoyerDemandeSortie(motif, date_sortie) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    throw new Error('Utilisateur non authentifié');
  }

  // Formater la date au format MySQL DATETIME : "YYYY-MM-DD HH:mm:ss"
  // Input HTML datetime-local renvoie "2025-07-06T10:00"
  const formattedDateSortie = date_sortie.replace('T', ' ') + ':00';

  return axios.post(API_URL, {
    motif,
    date_sortie: formattedDateSortie,
    id_utilisateur: user.id,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
