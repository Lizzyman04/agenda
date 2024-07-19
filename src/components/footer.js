// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../indexedDB';

const Footer = () => {
  const [settings, setSettings] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(Notification.permission === 'granted');
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSettings(1);
      setSettings(settings);
      if (settings) {
        setName(settings.name || '');
        setPassword(settings.password || '');
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    const newSettings = { name, password };
    await saveSettings(newSettings);
    setSettings(newSettings);
    setIsEditing(false);
  };

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
    } else if (permission === 'denied') {
      window.location.href = '/termos-de-uso/#notificacoes';
    }
  };

  return (
    <footer className="footer">
      <p>{settings && settings.name ? `Olá, ${settings.name}` : 'Usuário Anônimo'} |
        <button className="settings-btn" onClick={() => setIsEditing(!isEditing)}>
          {settings ? 'Alterar Configurações' : 'Adicionar Definições'}
        </button>
      </p>
      <div className={`settings ${isEditing ? 'show' : ''}`}>
        <button className="close" onClick={() => setIsEditing(false)}>X</button>
        <input
          type="text"
          placeholder="Digite seu nome..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="password"
          placeholder="Digite a nova senha..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className='submit' onClick={handleSave}>Salvar</button>
      </div>
      <p>
        <a href="/termos-de-uso/#armazenamento-dados">Onde são armazenados os meus dados?</a>
        {!notificationsEnabled ? (
          <>
            {' | '}
            <button className="notifications-btn" onClick={requestNotificationPermission}>
              Ative as Notificações </button>
          </>
        ) : null}
      </p>
      <p>
        Feito com ❤️ usando React.
      </p>
      <p>
        {currentYear} &copy; <a href="https://tudocomlizzyman.com" target='_blank'>Tudo com Lizzyman</a>
      </p>
    </footer>
  );
};

export default Footer;