import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaList, FaSignOutAlt } from 'react-icons/fa';
import './DashboardEmploye.css'; // On réutilise le style employé pour l'uniformité

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
      <h2 style={{ margin: 0, color: '#fcbf49' }}>Sartex</h2>
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

function Sidebar({ onLogout, nbDemandes }) {
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 20px',
          backgroundColor: '#fcbf49',
          color: '#011627',
          fontWeight: 'bold',
          borderRadius: '5px',
          marginBottom: '10px',
          userSelect: 'none',
        }}
      >
        <FaList style={{ marginRight: 10 }} />
        Demandes à traiter
        {nbDemandes > 0 && (
          <span
            style={{
              backgroundColor: '#011627',
              color: '#fcbf49',
              borderRadius: '12px',
              padding: '2px 8px',
              marginLeft: 'auto',
              fontWeight: 'bold',
              fontSize: '0.8rem',
            }}
          >
            {nbDemandes}
          </span>
        )}
      </div>
      <div
        style={{ marginTop: 'auto', color: '#f44336', cursor: 'pointer' }}
        onClick={onLogout}
      >
        <FaSignOutAlt style={{ marginRight: 10 }} /> Déconnexion
      </div>
    </div>
  );
}

function ListeDemandesAValider({ onDemandesChange }) {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = getToken();

  const fetchDemandes = async () => {
    try {
      const res = await axios.get('http://localhost:3000/demandesortie/responsable/a_valider', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDemandes(res.data);
      setError('');
      onDemandesChange(res.data.length); // On informe le parent du nouveau nombre
    } catch (err) {
      setError("Erreur lors du chargement des demandes.");
      console.error(err);
      onDemandesChange(0);
    } finally {
      setLoading(false);
    }
  };

  const traiterDemande = async (id, action) => {
    const confirmation = window.confirm(
      `Êtes-vous sûr de vouloir ${action === 'validee' ? 'valider' : 'refuser'} cette demande ?`
    );
    if (!confirmation) return;

    try {
      await axios.put(
        `http://localhost:3000/demandesortie/${id}/valider`,
        { statut: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDemandes(); // Recharge les demandes et met à jour le parent
    } catch (err) {
      alert("Erreur lors du traitement.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDemandes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h3>Demandes à traiter</h3>
      {demandes.length === 0 ? (
        <p>Aucune demande en attente.</p>
      ) : (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Employé</th>
              <th>Date demande</th>
              <th>Date sortie</th>
              <th>Motif</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {demandes.map((d) => (
              <tr key={d.id}>
                <td>{d.nom} {d.prenom}</td>
                <td>{new Date(d.date_demande).toLocaleString('fr-FR')}</td>
                <td>{new Date(d.date_sortie).toLocaleString('fr-FR')}</td>
                <td>{d.motif}</td>
                <td>
                  <button
                    className="btn btn-envoyer"
                    onClick={() => traiterDemande(d.id, 'validee')}
                  >
                    Valider
                  </button>{' '}
                  <button
                    className="btn btn-supprimer"
                    onClick={() => traiterDemande(d.id, 'refusee')}
                    style={{ backgroundColor: '#dc3545', color: '#fff' }}
                  >
                    Refuser
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function DashboardResponsable() {
  const [nbDemandes, setNbDemandes] = useState(0);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Nouvelle fonction fetch qui sera appelée au chargement et après chaque modif
  const fetchDemandesCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/demandesortie/responsable/a_valider', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNbDemandes(res.data.length);
    } catch (error) {
      console.error(error);
      setNbDemandes(0);
    }
  };

  useEffect(() => {
    fetchDemandesCount();
  }, []);

  return (
    <>
      <Header />
      <div className="dashboard-layout" style={{ display: 'flex' }}>
        <Sidebar onLogout={handleLogout} nbDemandes={nbDemandes} />
        <main className="dashboard-main" style={{ flex: 1, padding: '1rem' }}>
          <ListeDemandesAValider onDemandesChange={setNbDemandes} />
        </main>
      </div>
    </>
  );
}


