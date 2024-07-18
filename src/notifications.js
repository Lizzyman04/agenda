// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import notificationsData from './phrases/notifications.json';

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

const getRandomNotification = () => {
    const notifications = notificationsData;
    const randomIndex = Math.floor(Math.random() * notifications.length);
    return notifications[randomIndex];
};

const createNotifications = (createdAt, deadline, importance, task_desc) => {
    const notificationDates = calculateNotifications(createdAt, deadline, importance);
    return notificationDates.map(date => {
        const { title, left_desc, right_desc } = getRandomNotification();
        const message = `${left_desc} ${task_desc} ${right_desc}`;
        const sendDate = date.toISOString();

        scheduleNotification(title, message, new Date(sendDate).getTime());

        return {
            task_desc,
            sendDate,
            title,
            message,
            status: 'pending'
        };
    });
};

const scheduleNotification = (title, body, time) => {
    if (!('Notification' in window)) {
        return console.error('Este navegador não suporta notificações.');
    }

    const requestPermission = () => {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') scheduleNotification(title, body, time);
            else console.error('Permissão para notificações não concedida.');
        });
    };

    if (Notification.permission !== 'granted') return requestPermission();

    const now = Date.now();
    const delay = Math.max(time - now, 60 * 1000);

    console.log('Delay (ms):', delay, 'Scheduled time:', new Date(now + delay).toString());

    setTimeout(() => {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body.replace(/<[^>]*>?/gm, ''),
                icon: '/assets/img/agenda-logo.png',
                tag: 'task-notification'
            });
        }).catch(console.error);
    }, delay);
};

export { scheduleNotification, createNotifications };