// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import notificationsData from './phrases/notifications.json';
import { getSettings } from './indexedDB';

const calculateNotifications = (createdAt, deadline, importance) => {
    const createdDate = new Date(createdAt);
    const deadlineDate = new Date(deadline);
    const baseInterval = (deadlineDate - createdDate) / (importance * 2);
    const notifications = [];

    for (let i = 1; i <= importance * 2; i++) {
        notifications.push(new Date(createdDate.getTime() + baseInterval * i));
    }

    const pen = notifications[notifications.length - 2].getTime();
    const extra = (notifications[notifications.length - 1] - pen) / (importance + 1);

    for (let i = 1; i <= importance; i++) {
        notifications.splice(notifications.length - 1, 0, new Date(pen + extra * i));
    }

    return notifications;
};

const getNotificationDetails = async (desc) => {
    const { title, left_desc, right_desc } = notificationsData[Math.floor(Math.random() * notificationsData.length)];
    const { name: username = '' } = await getSettings(1) || {};

    const formatString = str => str.replace('_username_', username ? ` ${username}` : '');
    const formattedTitle = formatString(title);
    const formattedMessage = `${formatString(left_desc)} ${formatString(desc)} ${formatString(right_desc)}`;

    return { title: formattedTitle, message: formattedMessage };
};

const createNotifications = async (createdAt, deadline, importance, desc) => {
    const notificationDates = calculateNotifications(createdAt, deadline, importance);
    const notifications = await Promise.all(notificationDates.map(async date => {
        const { title, message } = await getNotificationDetails(desc);
        const sendDate = date.toISOString();
        
        scheduleNotification(title, message, date.getTime());

        return { desc, sendDate, title, message, status: 'pending' };
    }));

    return notifications;
};

const showToast = (message) => {
    const toastMessage = document.querySelector("#toast-message");
    const toast = document.querySelector(".toast");

    toastMessage.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 10000);
};

const requestNotificationPermission = (callback) => {
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            showToast('PERFEITO! Mantenha o navegador aberto para receber notificações.');
            callback();
        } else {
            showToast('Permita que a agenda lhe envie notificações para lembrar das suas tarefas.');
            console.error('Permissão para notificações não concedida.');
        }
    });
};

const scheduleNotification = (title, body, time) => {
    if (!('Notification' in window)) {
        showToast('Este navegador não suporta notificações.');
        return console.error('Este navegador não suporta notificações.');
    }

    if (Notification.permission !== 'granted') {
        return requestNotificationPermission(() => scheduleNotification(title, body, time));
    }

    const now = Date.now();
    const delay = Math.max(time - now, 100);

    navigator.serviceWorker.ready.then(registration => {
        registration.active.postMessage({
            action: 'schedule-notification',
            title, body, delay
        });
        console.log('Notification:', title, ' was scheduled for:', new Date(now + delay).toString());
    });
};

export { scheduleNotification, createNotifications };