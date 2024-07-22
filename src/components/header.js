// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import React, { useState, useEffect, useRef } from 'react';
import { getTask } from '../indexedDB';
import { useSettings } from './context/SettingsContext';

const Header = () => {
  const { settings } = useSettings();
  const [timeLeft, setTimeLeft] = useState({
    days: '000',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
  const [mainTask, setMainTask] = useState('');
  const [greeting, setGreeting] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (!settings) return;

    const fetchMainTask = async () => {
      if (settings.fixedTaskId) {
        const task = await getTask(settings.fixedTaskId);
        if (task) {
          setMainTask(task.description);
          calculateAndSetTimeLeft(task.deadline);
        }
      } else {
        setMainTask('');
        setTimeLeft({
          days: '000',
          hours: '00',
          minutes: '00',
          seconds: '00',
        });
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
      setGreeting(getGreeting(settings.name));
    };

    const calculateAndSetTimeLeft = (deadline) => {
      const calculateTimeLeft = () => {
        const eventDate = new Date(deadline);
        const currentTime = new Date();
        const difference = eventDate - currentTime;

        let timeLeft = {};
        if (difference > 0) {
          timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          };
        } else {
          timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        return timeLeft;
      };

      const updateCountdown = () => {
        const timeLeft = calculateTimeLeft();
        setTimeLeft({
          days: timeLeft.days.toString().padStart(3, '0'),
          hours: timeLeft.hours.toString().padStart(2, '0'),
          minutes: timeLeft.minutes.toString().padStart(2, '0'),
          seconds: timeLeft.seconds.toString().padStart(2, '0'),
        });
      };

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      updateCountdown();
      timerRef.current = setInterval(updateCountdown, 1000);
    };

    fetchMainTask();
  }, [settings]);

  const getGreeting = (name) => {
    const hours = new Date().getHours();
    const timeOfDay = hours < 12 ? 'Bom dia' : hours < 18 ? 'Boa tarde' : 'Boa noite';

    const dayOfWeek = new Intl.DateTimeFormat('pt-PT', { weekday: 'long' }).format(new Date());
    const preposition = ['sábado', 'domingo'].includes(dayOfWeek) ? 'neste' : 'nesta';

    return `${timeOfDay}${name ? ` ${name}` : ''}, como está ${preposition} ${dayOfWeek}?`;
  };

  const isTimeCritical = () => {
    return parseInt(timeLeft.days) === 0 && parseInt(timeLeft.hours) < 24;
  };

  return (
    <div>
      <div className="logo">
        <img src="/assets/img/agenda.png" alt="AGENDA - Uma tarefa espera por você!" />
      </div>
      <div className="greeting">{greeting}</div>
      <div className={`countdown ${mainTask && isTimeCritical() ? 'exp' : ''}`}>
        <div className="counter">
          <div className="days-countdown">
            <span className="days-value value">{timeLeft.days}</span>
            <p className="label">Dias</p>
          </div>
          <strong>:</strong>
          <div className="hours-countdown">
            <span className="hours-value value">{timeLeft.hours}</span>
            <p className="label">Horas</p>
          </div>
          <strong>:</strong>
          <div className="minutes-countdown">
            <span className="minutes-value value">{timeLeft.minutes}</span>
            <p className="label">Minutos</p>
          </div>
          <strong>:</strong>
          <div className="seconds-countdown">
            <span className="seconds-value value">{timeLeft.seconds}</span>
            <p className="label">Segundos</p>
          </div>
        </div>
        <h1 className="main-task">{mainTask || 'Nenhuma tarefa foi fixada!'}</h1>
      </div>
    </div>
  );
};

export default Header;
