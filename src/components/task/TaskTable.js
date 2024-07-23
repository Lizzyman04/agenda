// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import React, { useEffect, useState } from 'react';
import { getTasks, editTask, removeTask, getSettings, saveSettings } from '../../indexedDB';
import { useSettings } from '../context/SettingsContext';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ptBR } from 'date-fns/locale';
import { addMinutes, setHours, setMinutes, isToday } from 'date-fns';

const TaskTable = () => {
  const now = new Date();

  const [filter, setFilter] = useState('all');
  const { settings, setSettings } = useSettings();
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(now);
  const [importance, setImportance] = useState(1);
  const [done, setDone] = useState("0%");

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await getTasks();
      const { fixedTaskId } = await getSettings(1) || {};

      const updatedTasks = tasks.map(task => ({
        ...task,
        done: task.done || "0%",
        ...(task.id === fixedTaskId ? { isPinned: true } : {})
      }));

      setTasks(updatedTasks);
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    if (selectedTaskId) {
      const task = tasks.find(t => t.id === parseInt(selectedTaskId));
      setSelectedTask(task);
      if (task) {
        setDescription(task.description);
        setDeadline(new Date(task.deadline));
        setImportance(task.importance);
        setDone(task.done);
      }
    } else {
      setSelectedTask(null);
    }
  }, [selectedTaskId, tasks]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.done === '100%';
    if (filter === 'uncompleted') return task.done !== '100%';
    return true;
  });

  const handleToggleDone = async (task) => {
    const updatedTask = { ...task, done: task.done !== "100%" ? "100%" : "0%" };
    setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    await editTask(updatedTask);
  };

  const handleEditTask = async () => {
    const updatedTask = { ...selectedTask, description, deadline, importance, done };
    await editTask(updatedTask);

    if (settings?.fixedTaskId && settings.fixedTaskId === selectedTask.id) {
      const updatedSettings = { ...settings, fixedTaskId: updatedTask.id };
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
    }

    setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
    setIsEditing(false);
    setSelectedTaskId(null);
  };

  const handleDeleteTask = async (id) => {
    await removeTask(id);

    if (settings?.fixedTaskId && settings.fixedTaskId === id) {
      const updatedSettings = { ...settings, fixedTaskId: '' };
      await saveSettings(updatedSettings);
      setSettings(updatedSettings);
    }

    setTasks(tasks.filter(t => t.id !== id));
    setSelectedTaskId(null);
  };

  const handlePinTask = async (task) => {
    const updatedSettings = {
      ...settings,
      fixedTaskId: task.isPinned ? '' : task.id,
    };
    await saveSettings(updatedSettings);
    setSettings(updatedSettings);
    setTasks(tasks.map(t => t.id === task.id ? { ...t, isPinned: !t.isPinned } : { ...t, isPinned: false }));
  };

  const handleDateChange = (date) => {
    setDeadline(date);
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatRemainingTime = (deadline, done) => {
    if (done === "100%") return "Tarefa concluída";

    const date = new Date(deadline);
    const diffMs = date - now;

    const absDiffMs = Math.abs(diffMs);
    const diffDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs < 0) {
      if (diffDays >= 1) {
        return `Atrasado por ${diffDays} dia(s) e ${diffHours} hora(s)`;
      } else {
        return `Atrasado por ${diffHours} hora(s) e ${diffMinutes} minuto(s)`;
      }
    }

    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      return `${diffMonths} mes(es) e ${remainingDays} dia(s)`;
    } else if (diffDays > 7) {
      const diffWeeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      return `${diffWeeks} semana(s) e ${remainingDays} dia(s)`;
    } else if (diffDays >= 1) {
      return `${diffDays} dia(s) e ${diffHours} hora(s)`;
    } else {
      return `${diffHours} hora(s) e ${diffMinutes} minuto(s)`;
    }
  };

  const minDate = now;
  const minTime = isToday(deadline) ? addMinutes(now, 10) : null;
  const maxTime = isToday(deadline) ? setHours(setMinutes(now, 59), 23) : null;

  return (
    <div>
      {isEditing ? (
        <div className="simple-form">
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
          />
          <div className="date-input">
            <DatePicker
              selected={deadline}
              onChange={handleDateChange}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="Pp"
              locale={ptBR}
              minDate={minDate}
              minTime={minTime}
              maxTime={maxTime}
              placeholderText="Selecione a data e a hora"
              className="input-field"
            />
          </div>
          <select
            value={importance}
            onChange={(e) => setImportance(parseInt(e.target.value))}
            className="input-field"
          >
            <option value={1}>Muito baixa</option>
            <option value={2}>Baixa</option>
            <option value={3}>Média</option>
            <option value={4}>Alta</option>
            <option value={5}>Muito alta</option>
          </select>
          <label className={`task-status ${done === "100%" ? 'completed' : 'not-completed'}`}>
            <input
              type="checkbox"
              checked={done === "100%"}
              onChange={() => setDone(done !== "100%" ? "100%" : "0%")}
            />
            {done === "100%" ? 'Tarefa Concluída' : 'Tarefa Não Concluída'}
          </label>
          <button className='save-changes' onClick={handleEditTask}>Salvar Alterações</button>
        </div>
      ) : (
        <>
          <div className="mobile-select">
            <select
              value={selectedTaskId || ''}
              onChange={(e) => setSelectedTaskId(e.target.value)}
            >
              <option value="" disabled>Selecione uma tarefa</option>
              {tasks.map(task => (
                <option key={task.id} value={task.id}>{task.description}</option>
              ))}
            </select>
          </div>
          <div className="mobile-selected">
            {selectedTask ? (
              <div>
                <p><strong>Nome: </strong>{selectedTask.description}</p>
                <p><strong>Prazo: </strong>{formatDeadline(selectedTask.deadline)}</p>
                <p><strong>Tempo Restante: </strong>{formatRemainingTime(selectedTask.deadline, selectedTask.done)}</p>
                <p><strong>Importância: </strong>{['Muito baixa', 'Baixa', 'Média', 'Alta', 'Muito alta'][selectedTask.importance - 1]}</p>
                <div className="actions">
                  <button onClick={() => { setIsEditing(true); }}><span className="css-icon edit-icon"></span></button>
                  <button onClick={() => handleDeleteTask(selectedTask.id)}><span className='css-icon delete-icon'></span></button>
                  <button
                    onClick={() => handlePinTask(selectedTask)}
                    className={selectedTask.isPinned ? 'pinned' : ''}
                  >
                    <span className={`css-icon ${selectedTask.isPinned ? 'unpin-icon' : 'pin-icon'}`}></span>
                  </button>
                </div>
              </div>
            ) : (
              <p>Selecione uma tarefa para ver os detalhes</p>
            )}
          </div>
        </>
      )}
      <div className='table-container'>
        <table className="task-table">
          <caption>
            <div className="task-filter">
              <button
                className={filter === 'all' ? 'all active' : 'all'}
                onClick={() => handleFilterChange('all')}
              >
                Todas
              </button>
              <button
                className={filter === 'uncompleted' ? 'uncompleted active' : 'uncompleted'}
                onClick={() => handleFilterChange('uncompleted')}
              >
                Não Concluídas
              </button>
              <button
                className={filter === 'completed' ? 'completed active' : 'completed'}
                onClick={() => handleFilterChange('completed')}
              >
                Concluídas
              </button>
            </div>
          </caption>
          <thead>
            <tr>
              <th>Feito</th>
              <th>Tarefa</th>
              <th>Prazo</th>
              <th>Tempo Restante</th>
              <th>Importância</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map(task => (
              <tr key={task.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={task.done === "100%"}
                    onChange={() => handleToggleDone(task)}
                  />
                </td>
                <td className="task-name">{task.description}</td>
                <td className="deadline">{formatDeadline(task.deadline)}</td>
                <td className="remain-time">{formatRemainingTime(task.deadline, task.done)}</td>
                <td className="importance">{['Muito baixa', 'Baixa', 'Média', 'Alta', 'Muito alta'][task.importance - 1]}</td>
                <td className="actions">
                  <button onClick={() => {
                    setSelectedTaskId(task.id);
                    setIsEditing(true);
                  }}><span className="css-icon edit-icon"></span></button>
                  <button onClick={() => handleDeleteTask(task.id)}><span className="css-icon delete-icon"></span></button>
                  <button
                    onClick={() => handlePinTask(task)}
                    className={task.isPinned ? 'pinned' : ''}
                  >
                    <span className={`css-icon ${task.isPinned ? 'unpin-icon' : 'pin-icon'}`}></span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;