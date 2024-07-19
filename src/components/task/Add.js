// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda
import React, { useState } from 'react';
import GTDForm from './GTDForm';
import { addTask } from '../../indexedDB';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { setMinutes, setHours, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Add = () => {
  const [method, setMethod] = useState(null);
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [importance, setImportance] = useState(3);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSimpleSubmit = () => {
    if (validateForm()) {
      const task = {
        description,
        deadline,
        importance
      };
      addTask(task);
      setDescription('');
      setDeadline(null);
      setImportance(3);
      setMethod(null);
      setErrorMessage('');
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

  const currentTime = new Date();

  return (
    <div className="add-task">
      {!method ? (
        <div>
          <div className="method-description">
            <p>Escolha um método para adicionar sua tarefa:</p>
            <ol>
              <li>
                <p><strong>Adicionar Tarefa (Simples):</strong> Insira as informações básicas da tarefa (nome, prazo e importância). Este método é rápido e direto, perfeito para adicionar tarefas rapidamente sem muita organização.</p>
              </li>
              <li>
                <p><strong>GTD (Getting Things Done):</strong> Avalie se a tarefa precisa ser feita e determine sua urgência. Este método sistemático aumenta a produtividade ao organizar tarefas e compromissos de forma eficiente, seguindo os passos de capturar, esclarecer, organizar, refletir e executar.</p>
              </li>
            </ol>
          </div>
          <div className="method-selection">
            <button onClick={() => setMethod('Simple')}>Adicionar Tarefa</button>
            <button onClick={() => setMethod('GTD')}>GTD (Getting Things Done)</button>
          </div>
        </div>
      ) : method === 'GTD' ? (
        <GTDForm addTask={addTask} onClose={handleClose} />
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
              minDate={new Date()}
              minTime={addMinutes(new Date(), 10)}
              maxTime={setHours(setMinutes(new Date(), 59), 23)}
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
