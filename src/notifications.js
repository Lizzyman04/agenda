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

const showToast = (message) => {
    const toastMessage = document.querySelector("#toast-message");
    const toast = document.querySelector(".toast");

    toastMessage.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 10000);
}

const scheduleNotification = (title, body, time) => {
    if (!('Notification' in window)) {
        showToast('Este navegador não suporta notificações.');
        return console.error('Este navegador não suporta notificações.');
    }

    const requestPermission = () => {
        Notification.requestPermission().then(permission => {
            if (!localStorage.getItem('notificationPermissionGranted')) {
                if (permission === 'granted') {
                    localStorage.setItem('notificationPermissionGranted', 'true');
                    showToast('PERFEITO! Mantenha o navegador aberto para receber notificações.');
                    scheduleNotification(title, body, time);
                    scheduleNotification(
                        'Lembrete: Navegador Em Segundo Plano',
                        'Mantenha o navegador aberto para receber notificações da AGENDA. Se você fechar o navegador, é possível que não receba as notificações!',
                        Date.now()
                    );
                } else {
                    localStorage.setItem('notificationPermissionGranted', 'false');
                    showToast('Permita que a agenda lhe envie notificações para lembrar das suas tarefas.');
                    console.error('Permissão para notificações não concedida.');
                }
            } else if (localStorage.getItem('notificationPermissionGranted') != "true") {
                location.href = "/termos-de-uso/#notificacoes";
            }
        });
    };

    if (Notification.permission !== 'granted') return requestPermission();

    const now = Date.now();
    const delay = Math.max(time - now, 60 * 1000);

    navigator.serviceWorker.ready.then(registration => {
        const interval = setInterval(() => {
            if (navigator.serviceWorker.controller) {
                clearInterval(interval);
                navigator.serviceWorker.controller?.postMessage({
                    action: 'schedule-notification',
                    title, body, delay
                });
                console.log('Notification:', title, ' was scheduled for:', new Date(now + delay).toString());
            }
        }, 100);
    });
};

export { scheduleNotification, createNotifications };