// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import React, { useState, useEffect } from 'react';
import Header from './components/header';
import Footer from './components/footer';
import Utils from './components/utils';
import { getSettings } from './indexedDB';
import { getPhrase } from './phrases/getPhrase';

const App = () => {
  const [passwordExists, setPasswordExists] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [error, setError] = useState('');
  const [activeButton, setActiveButton] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [phrase, setPhrase] = useState('');

  const loadingTime = 5000;

  useEffect(() => {

    const fetchPhrase = async () => {
      const result = await getPhrase();
      setPhrase(result);
    };

    fetchPhrase();
    const checkPassword = async () => {
      const settings = await getSettings(1);
      if (settings && settings.password) {
        setPasswordExists(true);
        if (sessionStorage.getItem('sessionPassword') === settings.password) {
          setAuthenticated(true);
        }
      }

      setTimeout(() => {
        setLoading(false);
      }, loadingTime);
    };

    checkPassword();

    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + (100 / (loadingTime / 100));
      });
    }, 100);

    return () => clearInterval(interval);
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

  const handleSelect = (button) => {
    setActiveButton(button);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="logo-login">
          <img
            src="/assets/img/agenda.png"
            alt="AGENDA - Uma tarefa espera por você!"
          />
        </div>
        <h1 className="loading-message">Carregando...</h1>
        <blockquote dangerouslySetInnerHTML={{ __html: phrase }} />
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

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
      <Utils activeButton={activeButton} onSelect={handleSelect} />
      <Footer />
    </div>
  );
};

export default App;
