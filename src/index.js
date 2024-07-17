// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições.
// Por favor, leia o arquivo LICENSE na raiz do projeto.
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registrado com sucesso:', registration);
        }).catch(error => {
            console.log('Falha ao registrar o SW:', error);
        });
    });
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);