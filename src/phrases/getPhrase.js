// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import phrasesData from './phrases.json';
import { scheduleNotification } from '../notifications';

const getRandomTimeInPeriod = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const getPhrase = () => {
    const now = new Date();
    const todayDate = now.toDateString();
    const hour = now.getHours();
    const period = hour < 12 ? 'morning' : 'afternoon';
    let stored = JSON.parse(localStorage.getItem('motivationalPhrase')) || {};

    if (stored.date === todayDate && stored.period === period) {
        const currentPhrase = stored.phrases.find(p => p.date === todayDate && p.period === period);
        if (currentPhrase) return currentPhrase.phrase;
    }

    const phrasesForWeek = [];
    for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 2; j++) {
            const phrase = phrasesData.phrases[Math.floor(Math.random() * phrasesData.phrases.length)];
            const phraseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i).toDateString();
            const phrasePeriod = j === 0 ? 'morning' : 'afternoon';

            phrasesForWeek.push({ date: phraseDate, period: phrasePeriod, phrase });

            let startPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, j === 0 ? 0 : 12);
            const endPeriod = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, j === 0 ? 12 : 20);
            startPeriod = startPeriod < now ? new Date(now.getTime() + 5 * 60 * 1000) : startPeriod;

            const notificationTime = getRandomTimeInPeriod(startPeriod, endPeriod);

            const title = phrasesData.notificationTitles[Math.floor(Math.random() * phrasesData.notificationTitles.length)];
            scheduleNotification(title, phrase, notificationTime.getTime());
        }
    }

    localStorage.setItem('motivationalPhrase', JSON.stringify({ date: todayDate, period, phrases: phrasesForWeek }));

    const currentPhrase = phrasesForWeek.find(p => p.date === todayDate && p.period === period);
    return currentPhrase ? currentPhrase.phrase : phrasesForWeek[0].phrase;
};

export { getPhrase };
