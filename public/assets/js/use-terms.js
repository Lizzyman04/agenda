// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

document.addEventListener("DOMContentLoaded", () => {
    'use strict';

    const showToast = (message) => {
        const toastMessage = document.querySelector("#toast-message");
        const toast = document.querySelector(".toast");

        toastMessage.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
            toast.classList.remove("show");
        }, 10000);
    };

    let attempts = 0;

    const test = document.querySelector(".test-notifications");

    test.addEventListener('click', () => {
        attempts += 1;

        if ('serviceWorker' in navigator && 'Notification' in window) {
            navigator.serviceWorker.ready.then(registration => {
                registration.active.postMessage({
                    action: 'schedule-notification',
                    title: 'Teste de Notificação',
                    body: 'Esta é uma notificação de teste do AGENDA.',
                    delay: 1000
                });
                showToast(`Tentativa (${attempts}) - Notificação de teste enviada.`);
            });
        } else {
            showToast('Seu navegador não suporta notificações ou Service Workers.');
        }
    });
});