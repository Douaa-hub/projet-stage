import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, motDePasse);
    if (result.success) {
      const role = result.user.role;
      if (role === 'employe') navigate('/dashboard-employe');
      else if (role === 'responsable') navigate('/dashboard-responsable');
      else if (role === 'rh') navigate('/dashboard-rh');
      else if (role === 'gardien') navigate('/dashboard-gardien');
      else if (role === 'admin') navigate('/dashboard-admin');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img
          src="https://sartexgroup.com/wp-content/uploads/2020/01/logo-sartex.png"
          alt="Logo Sartex"
          className="logo"
        />
        <h2>Connexion</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            required
          />
          {error && <p className="error">{error}</p>}
          <button type="submit">Se connecter</button>
        </form>
      </div>
    </div>
  );
}
