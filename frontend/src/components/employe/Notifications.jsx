// Notifications.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getToken, getUser } from '../../services/authService';
import { FaBell } from 'react-icons/fa';
import { io } from 'socket.io-client';
import './Notifications.css';

export default function Notifications({ onDemandeValidee }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = getToken();
  const user = getUser();
  const userId = user?.id;

  // Récupérer les notifications depuis le backend
  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:3000/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des notifications.');
      console.error('Erreur API:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const socket = io('http://localhost:3000');
    socket.emit('join', userId);

    socket.on('nouvelle-notification', (notif) => {
      console.log('Notification reçue via socket:', notif);
      // Recharge la liste à chaque notification reçue
      fetchNotifications();
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]); // Ajout userId en dépendance pour éviter erreurs

  // Marquer la notification comme lue + redirection si besoin
  const handleClick = async (notif) => {
    if (notif.type === 'demande_sortie' && notif.id_demande_sortie) {
      onDemandeValidee(notif.id_demande_sortie);
    }

    if (Number(notif.lu) === 0) {
      try {
        await axios.put(
          `http://localhost:3000/notifications/${notif.id}/read`, // <-- corrigé ici
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Mise à jour locale plus rapide, évite un reload complet
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id ? { ...n, lu: 1 } : n
          )
        );
      } catch (err) {
        console.error('Erreur lors de la mise à jour de la notification comme lue:', err);
      }
    }
  };

  const nonLuesCount = notifications.filter((n) => Number(n.lu) === 0).length;

  if (loading) return <p>Chargement des notifications...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (notifications.length === 0) return <p>Aucune notification.</p>;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <FaBell size={24} style={{ marginRight: 10, color: '#fcbf49' }} />
        <h3>Notifications</h3>
        {nonLuesCount > 0 && <span className="notifications-badge">{nonLuesCount}</span>}
      </div>
      <ul className="notifications-list">
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className={`notification-item ${Number(notif.lu) === 0 ? 'non-lue' : ''}`}
            onClick={() => handleClick(notif)}
            title={notif.message}
            style={{ cursor: notif.type === 'demande_sortie' ? 'pointer' : 'default' }}
          >
            <p>{notif.message}</p>
            <small>{new Date(notif.date_envoi).toLocaleString('fr-FR')}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
















