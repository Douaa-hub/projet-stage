// DashboardEmploye.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getUser, getToken } from '../services/authService';
import { FaUserCircle, FaPlus, FaList, FaBell, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './DashboardEmploye.css';
import Notifications from '../components/employe/Notifications';
import { io } from 'socket.io-client';

// Header Component
function Header() {
  const user = getUser();
  return (
    <div
      style={{
        backgroundColor: '#003049',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderBottom: '4px solid #fcbf49',
        height: '70px',
      }}
    >
      <h2 style={{ margin: 0, color: '#fcbf49' }}> Sartex</h2>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FaUserCircle size={30} style={{ marginRight: 10 }} />
        <div>
          <div style={{ fontWeight: 'bold' }}>{user?.prenom}</div>
          <div style={{ fontSize: 12, color: '#ccc' }}>{user?.role}</div>
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar({ selected, setSelected, onLogout }) {
  const linkStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    cursor: 'pointer',
    backgroundColor: active ? '#fcbf49' : '#011627',
    color: active ? '#011627' : '#fefefe',
    fontWeight: active ? 'bold' : 'normal',
    borderRadius: '5px',
    marginBottom: '10px',
    userSelect: 'none',
    transition: 'background-color 0.3s',
  });

  return (
    <div
      style={{
        backgroundColor: '#011627',
        color: '#fefefe',
        width: '220px',
        minHeight: 'calc(100vh - 70px)',
        padding: '1.5rem',
        boxSizing: 'border-box',
      }}
    >
      <div style={linkStyle(selected === 'nouvelle')} onClick={() => setSelected('nouvelle')}>
        <FaPlus style={{ marginRight: 10 }} /> Nouvelle demande
      </div>
      <div style={linkStyle(selected === 'liste')} onClick={() => setSelected('liste')}>
        <FaList style={{ marginRight: 10 }} /> Mes demandes
      </div>
      <div style={linkStyle(selected === 'notifications')} onClick={() => setSelected('notifications')}>
        <FaBell style={{ marginRight: 10 }} /> Notifications
      </div>
      <div
        style={{ ...linkStyle(false), marginTop: 'auto', color: '#f44336', cursor: 'pointer' }}
        onClick={onLogout}
      >
        <FaSignOutAlt style={{ marginRight: 10 }} /> Déconnexion
      </div>
    </div>
  );
}

// Nouvelle Demande Component
function NouvelleDemande({ onSuccess }) {
  const [motif, setMotif] = React.useState('');
  const [dateSortie, setDateSortie] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const token = getToken();

  function formatLocalDate(date) {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      ' ' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes()) +
      ':' +
      pad(date.getSeconds())
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!motif || !dateSortie) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const dateObj = new Date(dateSortie);
      const formattedDate = formatLocalDate(dateObj);

      const response = await axios.post(
        'http://localhost:3000/demandesortie',
        { motif, date_sortie: formattedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        setMessage('✅ Demande envoyée avec succès.');
        setMotif('');
        setDateSortie('');
        setTimeout(() => {
          setMessage('');
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        setError('❌ Réponse inattendue du serveur.');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "❌ Erreur lors de l'envoi de la demande.";
      setError(errorMessage);
      console.error('Erreur API:', err.response?.data || err.message);
    }
  };

  return (
    <div>
      <h3>Nouvelle demande de sortie</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Motif :</label>
          <br />
          <input
            type="text"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Raison de la sortie"
            required
            style={{ width: '100%', padding: '8px', marginTop: 5 }}
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>Date de sortie :</label>
          <br />
          <input
            type="datetime-local"
            value={dateSortie}
            onChange={(e) => setDateSortie(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: 5 }}
          />
        </div>
        <button type="submit" className="btn btn-envoyer">
          Envoyer
        </button>
      </form>
      {message && <p style={{ color: 'green', marginTop: 10 }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
    </div>
  );
}

// Modale de modification de demande
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

// Liste Demandes Component
function ListeDemandes({ reloadTrigger, demandeSelectionneeId, clearHighlight }) {
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
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

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

// Composant principal DashboardEmploye avec Socket.IO
export default function DashboardEmploye() {
  const [selected, setSelected] = useState('nouvelle');
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [demandeSelectionneeId, setDemandeSelectionneeId] = useState(null);
  const navigate = useNavigate();
  const user = getUser();
  const userId = user?.id; // stable userId variable

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSuccessNewDemand = () => {
    setSelected('liste');
    setReloadTrigger((prev) => prev + 1);
  };

  const handleDemandeValidee = (idDemande) => {
    setSelected('liste');
    setReloadTrigger((prev) => prev + 1);
    setDemandeSelectionneeId(idDemande);
    setTimeout(() => {
      setDemandeSelectionneeId(null);
    }, 5000);
  };

  useEffect(() => {
    if (!userId) return;

    const socket = io('http://localhost:3000');
    socket.emit('join', userId);

    socket.on('nouvelle-notification', (notif) => {
      console.log('Notification reçue via socket:', notif);
      if (notif.type === 'demande_sortie' && notif.id_demande_sortie) {
        handleDemandeValidee(notif.id_demande_sortie);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []); // tableau vide pour ne créer la socket qu'une fois

  return (
    <>
      <Header />
      <div className="dashboard-layout" style={{ display: 'flex' }}>
        <Sidebar selected={selected} setSelected={setSelected} onLogout={handleLogout} />
        <main className="dashboard-main" style={{ flex: 1, padding: '1rem' }}>
          {selected === 'nouvelle' && <NouvelleDemande onSuccess={handleSuccessNewDemand} />}
          {selected === 'liste' && (
            <ListeDemandes
              reloadTrigger={reloadTrigger}
              demandeSelectionneeId={demandeSelectionneeId}
              clearHighlight={() => setDemandeSelectionneeId(null)}
            />
          )}
          {selected === 'notifications' && <Notifications onDemandeValidee={handleDemandeValidee} />}
        </main>
      </div>
    </>
  );
}










