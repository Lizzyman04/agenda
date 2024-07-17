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
        <a href="https://tudocomlizzyman.com" target='_blank'>Tudo com Lizzyman</a> &copy; {currentYear}
      </p>
    </footer>
  );
};

export default Footer;