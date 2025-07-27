import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getUser, getToken } from '../services/authService';

export default function MesDemandes({ demandeSelectionneeId, clearHighlight }) {
  const user = getUser();
  const token = getToken();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const lignesRefs = useRef({});

  const fetchDemandes = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/demandesortie/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDemandes(res.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des demandes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  // Scroll + surlignage
  useEffect(() => {
    if (demandeSelectionneeId && lignesRefs.current[demandeSelectionneeId]) {
      const element = lignesRefs.current[demandeSelectionneeId];
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const timer = setTimeout(() => {
        if (clearHighlight) clearHighlight();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [demandeSelectionneeId, clearHighlight]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (demandes.length === 0) return <p>Aucune demande trouvée.</p>;

  return (
    <div>
      <h3>Mes demandes de sortie</h3>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Date demande</th>
            <th>Date sortie</th>
            <th>Motif</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {demandes.map((d) => (
            <tr
              key={d.id}
              ref={el => (lignesRefs.current[d.id] = el)}
              style={{
                backgroundColor: demandeSelectionneeId === d.id ? '#fcbf49' : 'transparent',
                transition: 'background-color 0.5s ease',
              }}
            >
              <td>{new Date(d.date_demande).toLocaleString('fr-FR')}</td>
              <td>{new Date(d.date_sortie).toLocaleString('fr-FR')}</td>
              <td>{d.motif}</td>
              <td
                style={{
                  color:
                    d.statut === 'validee'
                      ? 'green'
                      : d.statut === 'refusee'
                      ? 'red'
                      : 'orange',
                  fontWeight: 'bold',
                }}
              >
                {d.statut}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}