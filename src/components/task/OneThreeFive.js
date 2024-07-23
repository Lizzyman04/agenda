// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import React, { useState, useEffect } from 'react';
import { getTasks, editTask } from '../../indexedDB';

const calculatePriority = task => (
  (task.importance / 5) * 0.35 +
  (1 - parseInt(task.done.replace('%', '')) / 100) * 0.25 +
  (Math.max(0, 86400000000 / ((new Date(task.deadline) - new Date()) + 5 * 86400000))) * 0.40
);

const prioritizeTasks = (tasks) => {
  const prioritized = tasks
    .filter(task => parseInt(task.done.replace('%', '')) < 100)
    .map(task => ({ ...task, priority: calculatePriority(task) }))
    .sort((a, b) => b.priority - a.priority);

  const mainTask = prioritized.slice(0, 1);

  const middleIndex = Math.floor(prioritized.length / 2);
  const mediumTasks = prioritized.slice(middleIndex - 1, middleIndex + 2);

  const minorTasks = prioritized.slice(-5);

  const uniqueMediumTasks = mediumTasks.filter(task => !mainTask.includes(task));
  const uniqueMinorTasks = minorTasks.filter(task => !mainTask.includes(task) && !uniqueMediumTasks.includes(task));

  return {
    main: mainTask,
    medium: uniqueMediumTasks,
    minor: uniqueMinorTasks
  };
};

const OneThreeFive = () => {
  const [filteredTasks, setFilteredTasks] = useState({ main: [], medium: [], minor: [] });
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchTasks = async () => {
      const tasks = await getTasks();
      setTasks(tasks);
      setFilteredTasks(prioritizeTasks(tasks));
    };

    fetchTasks();
  }, []);

  const handleStatusChangeClick = taskId => {
    if (editingTaskId === taskId) {
      setEditingTaskId(null);
    } else {
      setEditingTaskId(taskId);
      const task = tasks.find(t => t.id === taskId);
      setProgress(parseInt(task.done.replace('%', '')));
    }
  };

  const handleSaveChanges = async taskId => {
    const task = tasks.find(t => t.id === taskId);
    const updatedTask = { ...task, done: `${progress}%` };
    setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    await editTask(updatedTask);
    setEditingTaskId(null);
    const updatedTasks = await getTasks();
    setTasks(updatedTasks);
    setFilteredTasks(prioritizeTasks(updatedTasks));
  };

  const renderTask = (task, isMain = false) => (
    <li className="task" key={task.id}>
      <div className="task-content">
        <div className='task-content-i'>
          <span
            className={editingTaskId === task.id ? 'css-icon close-icon' : 'css-icon change-icon'}
            onClick={() => handleStatusChangeClick(task.id)}
          ></span>
          {isMain ? (
            <h2 className="primary-task">{task.description}</h2>
          ) : (
            <h3 className="secondary-task">{task.description}</h3>
          )}
        </div>
        {editingTaskId === task.id && (
          <div className="edit-progress">
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
      </div>
    </li>
  );

  return (
    <div className="one-three-five-rule">
      <p>Limite-se a uma tarefa principal, três tarefas secundárias e cinco tarefas menores com a regra 1-3-5. </p>
      <ul className="tasks-list">
        {filteredTasks.main.map(mainTask => (
          <React.Fragment key={mainTask.id}>
            {renderTask(mainTask, true)}
            <ul className="sub-tasks">
              {filteredTasks.medium.map(mediumTask => (
                <React.Fragment key={mediumTask.id}>
                  {renderTask(mediumTask)}
                  {mediumTask.id === filteredTasks.medium[filteredTasks.medium.length - 1].id && (
                    <ul className="third-party-tasks">
                      {filteredTasks.minor.map(minorTask => renderTask(minorTask))}
                    </ul>
                  )}
                </React.Fragment>
              ))}
            </ul>
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

export default OneThreeFive;
