import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import fr from 'date-fns/locale/fr';
import './DashboardGardien.css';

const NotificationGardien = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/notifications/details', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNotifications(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, lu: 1 } : n
      ));
    } catch (error) {
      console.error("Erreur lors du marquage comme lue", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return <div className="loading-notifications">Chargement des notifications...</div>;
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notifications récentes</h2>
        <button 
          className="refresh-btn"
          onClick={fetchNotifications}
          title="Actualiser les notifications"
        >
          <i className="fas fa-sync-alt"></i>
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <i className="fas fa-bell-slash"></i>
          <p>Aucune notification disponible</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`notification-item ${notif.lu ? 'read' : 'unread'}`}
              onClick={() => !notif.lu && markAsRead(notif.id)}
            >
              <div className="notification-content">
                <div className="notification-title">
                  {notif.type === 'validation_sortie' 
                    ? 'Demande de sortie validée' 
                    : 'Notification'}
                </div>
                
                <div className="notification-details">
                  {notif.type === 'validation_sortie' && (
                    <>
                      <div className="detail-row">
                        <span className="detail-label">Employé :</span>
                        <span className="detail-value">{notif.matricule || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Date sortie :</span>
                        <span className="detail-value">
                          {format(parseISO(notif.date_sortie), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Heure :</span>
                        <span className="detail-value">
                          {format(parseISO(notif.date_sortie), 'HH:mm')}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="notification-footer">
                <i className="far fa-clock"></i>
                {format(parseISO(notif.date_envoi), 'dd/MM/yyyy HH:mm', { locale: fr })}
              </div>

              {!notif.lu && (
                <div className="unread-badge">Nouveau</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationGardien;