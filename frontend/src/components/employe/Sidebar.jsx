import React from 'react';
import { FaSignOutAlt, FaBell, FaPlus, FaList } from 'react-icons/fa';

export default function Sidebar({ selected, onSelect }) {
  const menuItems = [
    { key: 'nouvelle', label: 'Nouvelle demande', icon: <FaPlus /> },
    { key: 'mesdemandes', label: 'Mes demandes', icon: <FaList /> },
    { key: 'notifications', label: 'Notifications', icon: <FaBell /> },
    { key: 'logout', label: 'Déconnexion', icon: <FaSignOutAlt /> },
  ];

  return (
    <div style={{
      width: '240px',
      backgroundColor: '#003049',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem 0'
    }}>
      <h2 style={{
        textAlign: 'center',
        color: '#fcbf49',
        marginBottom: '2rem',
        fontWeight: 'bold',
        fontSize: '20px'
      }}>
        🎯 Employé
      </h2>

      {menuItems.map(item => (
        <div
          key={item.key}
          onClick={() => onSelect(item.key)}
          style={{
            padding: '12px 24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: selected === item.key ? '#fcbf49' : 'transparent',
            color: selected === item.key ? '#003049' : 'white',
            fontWeight: selected === item.key ? 'bold' : 'normal'
          }}
        >
          <span style={{ marginRight: '10px' }}>{item.icon}</span>
          {item.label}
        </div>
      ))}
    </div>
  );
}
