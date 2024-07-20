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
import { addMinutes, setHours, setMinutes } from 'date-fns';

const TaskTable = () => {
  const { settings, setSettings } = useSettings();
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCheckboxEditing, setIsCheckboxEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [importance, setImportance] = useState(1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await getTasks();
      setTasks(tasks.map(task => ({ ...task, done: task.done || false })));
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

  const handleToggleDone = async (task) => {
    const updatedTask = { ...task, done: !task.done };
    await editTask(updatedTask);
    setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    setSelectedTaskId(task.id);
    setIsEditing(true);
    setIsCheckboxEditing(true);
  };

  const handleEditTask = async () => {
    const updatedTask = { ...selectedTask, description, deadline, importance, done };
    await editTask(updatedTask);
    setTasks(tasks.map(t => t.id === selectedTask.id ? updatedTask : t));
    setIsEditing(false);
    setIsCheckboxEditing(false);
    setSelectedTaskId(null);
  };

  const handleDeleteTask = async (id) => {
    await removeTask(id);
    setTasks(tasks.filter(t => t.id !== id));
    setSelectedTaskId(null);
  };

  const handlePinTask = async (task) => {
    const updatedSettings = {
      ...settings,
      fixedTaskId: task.isPinned ? '' : task.id,
    };
    console.log(updatedSettings)
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

  const formatRemainingTime = (deadline) => {
    const now = new Date();
    const date = new Date(deadline);
    const diffMs = date - now;
  
    const absDiffMs = Math.abs(diffMs);
    const diffDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));
  
    if (diffMs < 0) {
      if (diffDays >= 1) {
        return `Atrasado por ${diffDays} dias e ${diffHours} horas`;
      } else {
        return `Atrasado por ${diffHours} horas e ${diffMinutes} minutos`;
      }
    }
  
    if (diffDays > 30) {
      const diffMonths = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      return `${diffMonths} mes(es) e ${remainingDays} dias`;
    } else if (diffDays > 7) {
      const diffWeeks = Math.floor(diffDays / 7);
      const remainingDays = diffDays % 7;
      return `${diffWeeks} semana(s) e ${remainingDays} dias`;
    } else if (diffDays >= 1) {
      return `${diffDays} dias e ${diffHours} horas`;
    } else {
      return `${diffHours} horas e ${diffMinutes} minutos`;
    }
  };  

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
            disabled={isCheckboxEditing}
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
              minDate={new Date()}
              minTime={addMinutes(new Date(), 10)}
              maxTime={setHours(setMinutes(new Date(), 59), 23)}
              placeholderText="Selecione a data e a hora"
              className="input-field"
              disabled={isCheckboxEditing}
            />
          </div>
          <select
            value={importance}
            onChange={(e) => setImportance(e.target.value)}
            className="input-field"
            disabled={isCheckboxEditing}
          >
            <option value={1}>Muito baixa</option>
            <option value={2}>Baixa</option>
            <option value={3}>Média</option>
            <option value={4}>Alta</option>
            <option value={5}>Muito alta</option>
          </select>
          <label className={`task-status ${done ? 'completed' : 'not-completed'}`}>
            <input
              type="checkbox"
              checked={done}
              onChange={() => setDone(!done)}
            />
            {done ? 'Tarefa Concluída' : 'Tarefa Não Concluída'}
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
                <p><strong>Tempo Restante: </strong>{formatRemainingTime(selectedTask.deadline)}</p>
                <p><strong>Importância: </strong>{['Muito baixa', 'Baixa', 'Média', 'Alta', 'Muito alta'][selectedTask.importance - 1]}</p>
                <div className="actions">
                  <button onClick={() => { setIsEditing(true); setIsCheckboxEditing(false); }}><img className="task-icon" src="/assets/img/edit-task.svg" alt="Editar" /></button>
                  <button onClick={() => handleDeleteTask(selectedTask.id)}><img className="task-icon" src="/assets/img/delete-task.svg" alt="Eliminar" /></button>
                  <button
                    onClick={() => handlePinTask(selectedTask)}
                    className={selectedTask.isPinned ? 'pinned' : ''}
                  >
                    <img
                      className="task-icon"
                      src={selectedTask.isPinned ? '/assets/img/unpin-task.svg' : '/assets/img/pin-task.svg'}
                      alt="Destacar"
                    />
                  </button>
                </div>
              </div>
            ) : (
              <p>Selecione uma tarefa para ver os detalhes</p>
            )}
          </div>
        </>
      )}
      <table className="task-table">
        <thead>
          <tr>
            <th>Concluída</th>
            <th>Nome</th>
            <th>Prazo</th>
            <th>Tempo Restante</th>
            <th>Importância</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => handleToggleDone(task)}
                />
              </td>
              <td className="task-name">{task.description}</td>
              <td className="deadline">{formatDeadline(task.deadline)}</td>
              <td className="remain-time">{formatRemainingTime(task.deadline)}</td>
              <td className="importance">{['Muito baixa', 'Baixa', 'Média', 'Alta', 'Muito alta'][task.importance - 1]}</td>
              <td className="actions">
                <button onClick={() => {
                  setSelectedTaskId(task.id);
                  setIsEditing(true);
                  setIsCheckboxEditing(false);
                }}><img className="task-icon" src="/assets/img/edit-task.svg" alt="Editar" /></button>
                <button onClick={() => handleDeleteTask(task.id)}><img className="task-icon" src="/assets/img/delete-task.svg" alt="Eliminar" /></button>
                <button
                  onClick={() => handlePinTask(task)}
                  className={task.isPinned ? 'pinned' : ''}
                >
                  <img
                    className="task-icon"
                    src={task.isPinned ? '/assets/img/unpin-task.svg' : '/assets/img/pin-task.svg'}
                    alt="Destacar"
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;