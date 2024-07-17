// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

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

const createNotifications = (createdAt, deadline, importance, taskId) => {
    const notificationDates = calculateNotifications(createdAt, deadline, importance);
    return notificationDates.map(date => ({
        taskId,
        sendDate: date.toISOString(),
        message: `Notification for task ${taskId}`,
        status: 'pending'
    }));
};

export default createNotifications;