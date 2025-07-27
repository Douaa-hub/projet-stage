import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../services/authService';
import './ListeDemandesSortie.css';

function ModifierDemandeModal({ demande, onClose, onUpdated }) {
  const [motif, setMotif] = useState(demande.motif);
  const [dateSortie, setDateSortie] = useState(new Date(demande.date_sortie).toISOString().slice(0, 16));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const token = getToken();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!motif || !dateSortie) {
      setError('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }
    try {
      const formattedDate = new Date(dateSortie).toISOString().slice(0, 19).replace('T', ' ');
      const response = await axios.put(
        `http://localhost:3000/demandesortie/${demande.id}`,
        { motif, date_sortie: formattedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        onUpdated();
        onClose();
      } else {
        setError('Erreur inattendue du serveur.');
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Modifier la demande</h3>
        <form onSubmit={handleSubmit}>
          <label>Motif :</label>
          <input type="text" value={motif} onChange={(e) => setMotif(e.target.value)} required />
          <label>Date de sortie :</label>
          <input
            type="datetime-local"
            value={dateSortie}
            onChange={(e) => setDateSortie(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-envoyer">
            {loading ? 'Modification...' : 'Modifier'}
          </button>
          <button type="button" onClick={onClose} className="btn btn-cancel">
            Annuler
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ListeDemandes({ reloadTrigger, demandeSelectionneeId, clearHighlight }) {
  const user = getUser();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [demandeAModifier, setDemandeAModifier] = useState(null);
  const token = getToken();
  const lignesRefs = useRef({});

  useEffect(() => {
    if (demandeSelectionneeId && lignesRefs.current[demandeSelectionneeId]) {
      const element = lignesRefs.current[demandeSelectionneeId];
      element.scrollIntoView({ behavior: 'smooth', block: 'start' }); // Scroll en haut

      const timer = setTimeout(() => {
        if (clearHighlight) clearHighlight();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [demandeSelectionneeId, clearHighlight]);

  const fetchDemandes = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/demandesortie/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDemandes(res.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des demandes.');
      console.error('Erreur API:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDemandes();
  }, [reloadTrigger]);

  const handleModifier = (demande) => {
    setDemandeAModifier(demande);
  };

  const closeModal = () => {
    setDemandeAModifier(null);
  };

  const handleUpdated = () => {
    fetchDemandes();
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette demande ?')) return;
    try {
      await axios.delete(`http://localhost:3000/demandesortie/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Demande supprimée avec succès.');
      fetchDemandes();
    } catch (err) {
      alert('Erreur lors de la suppression.');
      console.error(err);
    }
  };

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h3>Mes demandes de sortie</h3>
      {demandes.length === 0 ? (
        <p>Aucune demande trouvée.</p>
      ) : (
        <>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Date demande</th>
                <th>Date sortie</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr
                  key={d.id}
                  ref={(el) => (lignesRefs.current[d.id] = el)}
                  className={demandeSelectionneeId === d.id ? 'highlighted' : ''}
                >
                  <td>{new Date(d.date_demande).toLocaleString('fr-FR')}</td>
                  <td>{new Date(d.date_sortie).toLocaleString('fr-FR')}</td>
                  <td>{d.motif}</td>
                  <td
                    style={{
                      color:
                        d.statut === 'validee' ? 'green' : d.statut === 'refusee' ? 'red' : 'orange',
                      fontWeight: 'bold',
                    }}
                  >
                    {d.statut}
                  </td>
                  <td>
                    {d.statut === 'en_attente' ? (
                      <>
                        <button
                          className="btn btn-modifier"
                          onClick={() => handleModifier(d)}
                          title="Modifier la demande"
                        >
                          Modifier
                        </button>{' '}
                        <button
                          className="btn btn-supprimer"
                          onClick={() => handleSupprimer(d.id)}
                          title="Supprimer la demande"
                        >
                          Supprimer
                        </button>
                      </>
                    ) : (
                      <em>—</em>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {demandeAModifier && (
            <ModifierDemandeModal demande={demandeAModifier} onClose={closeModal} onUpdated={handleUpdated} />
          )}
        </>
      )}
    </div>
  );
}



