import React, { useState } from 'react';
import axios from 'axios';
import { getToken } from '../services/authService';

export default function FormulaireDemandeSortie() {
  const [dateSortie, setDateSortie] = useState('');
  const [heureSortie, setHeureSortie] = useState('');
  const [motif, setMotif] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = getToken();

      // ✅ Combiner date et heure au format "YYYY-MM-DD HH:mm:ss"
      const date_sortie = `${dateSortie} ${heureSortie}:00`;

      const response = await axios.post(
        'http://localhost:3000/demandesortie',
        {
          date_sortie,
          motif,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage('✅ Demande envoyée avec succès.');
      setDateSortie('');
      setHeureSortie('');
      setMotif('');
    } catch (error) {
      setMessage(error.response?.data?.error || '❌ Erreur lors de l’envoi.');
    }
  };

  return (
    <div className="formulaire-container">
      <h2>Formulaire de demande de sortie</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={dateSortie}
          onChange={(e) => setDateSortie(e.target.value)}
          required
        />
        <input
          type="time"
          value={heureSortie}
          onChange={(e) => setHeureSortie(e.target.value)}
          required
        />
        <textarea
          placeholder="Motif"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          required
        />
        <button type="submit">Envoyer</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
