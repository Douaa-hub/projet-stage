import React from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { getUser } from '../../services/authService';

export default function Header() {
  const user = getUser();

  return (
    <div style={{
      backgroundColor: '#003049',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      borderBottom: '4px solid #fcbf49',
      height: '70px'
    }}>
      <h2 style={{ margin: 0, color: '#fcbf49' }}>🏢 Sartex</h2>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <FaUserCircle size={30} style={{ marginRight: '10px' }} />
        <div>
          <div style={{ fontWeight: 'bold' }}>{user?.prenom}</div>
          <div style={{ fontSize: '12px', color: '#ccc' }}>{user?.role}</div>
        </div>
      </div>
    </div>
  );
}
