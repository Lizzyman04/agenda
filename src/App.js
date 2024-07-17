// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import React, { useState, useEffect } from 'react';
import Header from './components/header';
import Footer from './components/footer';
import { getSettings } from './indexedDB';

const App = () => {
  const [passwordExists, setPasswordExists] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkPassword = async () => {
      const settings = await getSettings(1);
      if (settings && settings.password) {
        setPasswordExists(true);
        if (sessionStorage.getItem('sessionPassword') === settings.password) {
          setAuthenticated(true);
        }
      }
    };

    checkPassword();
  }, []);

  const handlePasswordSubmit = async () => {
    const settings = await getSettings(1);
    if (inputPassword === settings.password) {
      sessionStorage.setItem('sessionPassword', inputPassword);
      setAuthenticated(true);
      setError('');
    } else {
      setError('Senha incorreta');
    }
  };

  if (passwordExists && !authenticated) {
    return (
      <div className="login">
        <div className="logo-login">
        <img
          src="/assets/img/agenda.png"
          alt="AGENDA - Uma tarefa espera por você!"
        />
        </div>
        <div className="password-container">
          <input
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            placeholder="Digite a palavra-passe"
            className="password-input"
          />
          <button onClick={handlePasswordSubmit} className="submit-button">Entrar</button>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Footer />
    </div>
  );
};

export default App;