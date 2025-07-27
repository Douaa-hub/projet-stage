import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ children, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* Barre latérale */}
      <Sidebar selected={selected} onSelect={onSelect} />

      {/* Contenu principal */}
      <div style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <Header />
        <div style={{ padding: '2rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
