import React, { useState, useEffect } from 'react';
import { getTasks, editTask, removeTask } from '../../indexedDB';

const getQuadrant = (task) => {
  const isUrgent = (new Date(task.deadline) - new Date()) <= 20 * 24 * 60 * 60 * 1000;
  const isImportant = task.importance >= 3;
  if (isImportant && isUrgent) return 'important-urgent';
  if (isImportant && !isUrgent) return 'important-not-urgent';
  if (!isImportant && isUrgent) return 'not-important-urgent';
  return 'not-important-not-urgent';
};

const EisenhowerMatrix = () => {
  const [tasks, setTasks] = useState([]);
  const [movedTasks, setMovedTasks] = useState({});
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await getTasks();
      const filteredTasks = tasks.filter(task => parseInt(task.done.replace('%', '')) < 100 && new Date(task.deadline) >= new Date());
      setTasks(filteredTasks);
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    const savedMovedTasks = JSON.parse(localStorage.getItem('MovedTasks'));
    if (savedMovedTasks) {
      setMovedTasks(savedMovedTasks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('MovedTasks', JSON.stringify(movedTasks));
  }, [movedTasks]);

  const handleMoveTask = (task) => {
    const quadrantOrder = ['important-urgent', 'important-not-urgent', 'not-important-urgent', 'not-important-not-urgent'];
    const currentQuadrantIndex = quadrantOrder.indexOf(task.quadrant);
    const nextQuadrantIndex = (currentQuadrantIndex + 1) % quadrantOrder.length;
    const updatedTask = { ...task, quadrant: quadrantOrder[nextQuadrantIndex] };

    setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    const updatedMovedTasks = { ...movedTasks, [task.id]: updatedTask.quadrant };
    setMovedTasks(updatedMovedTasks);
  };

  const handleCompleteTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const updatedTask = { ...task, done: '100%' };
    setTasks(tasks.map(t => t.id === task.id ? updatedTask : t).filter(t => t.done !== '100%'));
    
    const updatedMovedTasks = { ...movedTasks };
    delete updatedMovedTasks[taskId];
    setMovedTasks(updatedMovedTasks);

    await editTask(updatedTask);
  };

  const handleDeleteTask = async (taskId) => {
    await removeTask(taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
    const updatedMovedTasks = { ...movedTasks };
    delete updatedMovedTasks[taskId];
    setMovedTasks(updatedMovedTasks);
  };

  const handleStatusChangeClick = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    setProgress(parseInt(task.done.replace('%', '')));
    setEditingTaskId(taskId === editingTaskId ? null : taskId);
  };

  const handleSaveChanges = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const updatedTask = { ...task, done: `${progress}%` };
    setTasks(tasks.map(t => t.id === task.id ? updatedTask : t).filter(t => t.done !== '100%'));
    setEditingTaskId(null);
    await editTask(updatedTask);
  };

  const renderTask = (task) => {
    return (
      <li key={task.id}>
        <div className="actions-e-desc">
          <button onClick={() => handleMoveTask(task)}>
            <span className="css-icon move-icon"></span>
          </button>
          {task.quadrant === 'important-urgent' && (
            <input
              type="checkbox"
              checked={task.done === '100%'}
              onChange={() => handleCompleteTask(task.id)}
            />
          )}
          {['not-important-urgent', 'important-not-urgent'].includes(task.quadrant) && (
            <button onClick={() => handleStatusChangeClick(task.id)}>
              <span
                className={editingTaskId === task.id ? 'css-icon close-icon' : 'css-icon change-icon'}
              ></span>
            </button>
          )}
          {task.quadrant === 'not-important-not-urgent' && (
            <button onClick={() => handleDeleteTask(task.id)}>
              <span class="css-icon delete-icon"></span>
            </button>
          )}
        <p>{task.description}</p>
        </div>
        {editingTaskId === task.id && (
          <div className='edit-progress'>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={e => setProgress(e.target.value)}
            />
            <span>{progress}%</span>
            <span className="css-icon save-icon" onClick={() => handleSaveChanges(task.id)}></span>
          </div>
        )}
      </li>
    );
  };

  const renderQuadrant = (quadrantName, title, subtitle) => (
    <div className={quadrantName}>
      <div className="paper">
        <div className="title">
          <p>{title}</p>
          <h1>{subtitle}</h1>
        </div>
        <ul>
          {tasks
            .filter(task => (movedTasks[task.id] ? movedTasks[task.id] === quadrantName : getQuadrant(task) === quadrantName))
            .map(task => {
              task.quadrant = quadrantName;
              return renderTask(task);
            })}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="eisenhower-matrix-container">
      <div className="eisenhower-matrix importants">
        {renderQuadrant('important-urgent', 'Importante e urgente', 'Faça')}
        {renderQuadrant('important-not-urgent', 'Importante e não urgente', 'Agende')}
      </div>
      <div className="eisenhower-matrix not-importants">
        {renderQuadrant('not-important-urgent', 'Não importante e urgente', 'Delegue')}
        {renderQuadrant('not-important-not-urgent', 'Não importante e não urgente', 'Delete')}
      </div>
    </div>
  );
};

export default EisenhowerMatrix;