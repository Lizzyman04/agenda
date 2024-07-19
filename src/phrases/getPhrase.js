// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import phrasesData from './phrases.json';
import { getSettings } from '../indexedDB';
import { scheduleNotification } from '../notifications';

const getRandomTimeInPeriod = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const getGreeting = (h) => h >= 18 || h < 4 ? "Boa noite" : h < 12 ? "Bom dia" : "Boa tarde";

const getPhrase = async () => {
    const now = new Date();
    const todayDate = now.toDateString();
    const hour = now.getHours();
    const period = hour < 12 ? 'morning' : 'afternoon';
    let stored = JSON.parse(localStorage.getItem('phrases')) || { phrases: [] };


    const generatePhrasesForPeriods = async (startDate, startPeriod, periods) => {
        const phrasesForPeriods = [];
        const settings = await getSettings(1);
        let currentDate = new Date(startDate);
        let currentPeriod = startPeriod;

        for (let i = 0; i < periods; i++) {
            const phrase = phrasesData.phrases[Math.floor(Math.random() * phrasesData.phrases.length)];
            const phraseDate = currentDate.toDateString();
            phrasesForPeriods.push({ date: phraseDate, period: currentPeriod, phrase });

            let startPeriodDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentPeriod === 'morning' ? 0 : 12);
            const endPeriodDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentPeriod === 'morning' ? 11 : 23, 59);
            startPeriodDate = startPeriodDate < now ? new Date(now.getTime() + 5 * 60 * 1000) : startPeriodDate;

            const notificationTime = getRandomTimeInPeriod(startPeriodDate, endPeriodDate);

            const title = Math.random() < 0.5
                ? `${getGreeting(notificationTime.getHours())}${settings?.name ? ` ${settings.name}` : ''}!`
                : phrasesData.notificationTitles[Math.floor(Math.random() * phrasesData.notificationTitles.length)];

            scheduleNotification(title, phrase, notificationTime.getTime());

            if (currentPeriod === 'morning') {
                currentPeriod = 'afternoon';
            } else {
                currentPeriod = 'morning';
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        return phrasesForPeriods;
    };

    if (stored.phrases.length === 0) {
        stored.phrases = await generatePhrasesForPeriods(now, period, 14);
        stored.date = todayDate;
        stored.period = period;
        localStorage.setItem('phrases', JSON.stringify(stored));
    }

    const oldestStoredDate = new Date(stored.phrases[0].date);
    if (oldestStoredDate < now) {

        stored.phrases = stored.phrases.filter(p => new Date(p.date) >= now);
        const missingPhrasesCount = 14 - stored.phrases.length;

        const lastStoredPhrase = stored.phrases[stored.phrases.length - 1];
        const lastStoredDate = new Date(lastStoredPhrase.date);
        const lastStoredPeriod = lastStoredPhrase.period === 'morning' ? 'afternoon' : 'morning';
        const startDate = lastStoredPhrase.period === 'afternoon' ? new Date(lastStoredDate.getTime() + 24 * 60 * 60 * 1000) : lastStoredDate;

        const newPhrases = await generatePhrasesForPeriods(startDate, lastStoredPeriod, missingPhrasesCount);
        stored.phrases = stored.phrases.concat(newPhrases);

        localStorage.setItem('phrases', JSON.stringify(stored));
    }

    const currentPhrase = stored.phrases.find(p => p.date === todayDate && p.period === period);
    return currentPhrase ? currentPhrase.phrase : stored.phrases[0].phrase;
};


export { getPhrase };
