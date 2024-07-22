// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import React, { useState } from 'react';
import GTDForm from './GTDForm';
import { addTask } from '../../indexedDB';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { setMinutes, setHours, addMinutes, isToday, isBefore, setSeconds, setMilliseconds, addHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Add = () => {

  const now = new Date();

  const getNextThreeHours = () => setMinutes(setSeconds(setMilliseconds(addHours(now, 3), 0), 0), 0);

  const [method, setMethod] = useState(null);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(getNextThreeHours());
  const [importance, setImportance] = useState(3);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSimpleSubmit = () => {
    if (validateForm()) {

      if (isBefore(deadline, addMinutes(now, 10))) {
        setErrorMessage('Data inválida: o prazo deve ser pelo menos 10 minutos no futuro.');
        return;
      }

      const task = {
        description,
        deadline,
        importance,
      };
      addTask(task);
      setDescription('');
      setDeadline(null);
      setImportance(3);
      setMethod(null);
      setErrorMessage('');
      setSuccessMessage(`Tarefa "${task.description}" adicionada com sucesso!`);
    } else {
      setErrorMessage('Por favor, preencha todos os campos antes de adicionar a tarefa.');
    }
  };

  const handleClose = () => {
    setMethod(null);
  };

  const handleDateChange = (date) => {
    setDeadline(date);
  };

  const validateForm = () => {
    return description !== '' && deadline !== null && importance !== null;
  };

  const minDate = now;
  const minTime = isToday(deadline) ? addMinutes(now, 10) : null;
  const maxTime = isToday(deadline) ? setHours(setMinutes(now, 59), 23) : null;

  return (
    <div className="add-task">
      {!method ? (
        <div className="method-description">
          {successMessage ? (
            <p className="success-m">{successMessage}</p>
          ) : (
            <>
              <p>Escolha um método para adicionar sua tarefa:</p>
              <ol>
                <li>
                  <p><strong>Adicionar Tarefa (Simples):</strong> Insira as informações básicas da tarefa (nome, prazo e importância). Este método é rápido e direto, perfeito para adicionar tarefas rapidamente.</p>
                </li>
                <li>
                  <p><strong>GTD (Getting Things Done):</strong> Avalie se a tarefa precisa ser feita e determine sua urgência. Este método é sistemático e aumenta a produtividade, capturando, esclarecendo, organizando, refletindo e executando as tarefas.</p>
                </li>
              </ol>
            </>
          )}
          <div className="method-selection">
            <button onClick={() => setMethod('Simple')}>Adicionar Tarefa (Simples)</button>
            <button onClick={() => setMethod('GTD')}>GTD (Getting Things Done)</button>
          </div>

        </div>
      ) : method === 'GTD' ? (
        <GTDForm addTask={addTask} onClose={handleClose} setSuccessMessage={setSuccessMessage} />
      ) : (
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
            onChange={(e) => setImportance(e.target.value)}
            className="input-field"
          >
            <option value={1}>Muito baixa</option>
            <option value={2}>Baixa</option>
            <option value={3}>Média</option>
            <option value={4}>Alta</option>
            <option value={5}>Muito alta</option>
          </select>
          {errorMessage && (
            <p className="error-m">{errorMessage}</p>
          )}
          <button
            onClick={handleSimpleSubmit}
            className="button"
          >
            Adicionar Tarefa
          </button>
          <button onClick={() => handleClose()} className="button cancel-button">Cancelar</button>
        </div>
      )}
    </div>
  );
};

export default Add;
