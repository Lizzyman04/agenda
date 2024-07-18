// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import React from 'react';
import TaskTable from './task/TaskTable';
import OneThreeFive from './task/OneThreeFive';
import EisenhowerMatrix from './task/EisenhowerMatrix';
import Add from './task/Add';
import { getPhrase } from '../phrases/getPhrase';

const Utils = ({ activeButton, onSelect }) => {
  return (
    <div className="container">
      <div className="motivational-phrase">
        <blockquote dangerouslySetInnerHTML={{ __html: getPhrase() }}></blockquote>
      </div>
      <div className={`utils ${activeButton ? 'u-up' : ''}`}>
        {(activeButton === null || activeButton === 'Add') && (
          <>
            <button
              className={`task-table ${activeButton === 'TaskTable' ? 'active' : ''}`}
              onClick={() => onSelect(activeButton === 'TaskTable' ? null : 'TaskTable')}
            >
              Tabela de Tarefas
            </button>
            <button
              className={`one-three-five ${activeButton === 'OneThreeFive' ? 'active' : ''}`}
              onClick={() => onSelect(activeButton === 'OneThreeFive' ? null : 'OneThreeFive')}
            >
              1 - 3 - 5
            </button>
            <button
              className={`eisenhower-matrix ${activeButton === 'EisenhowerMatrix' ? 'active' : ''}`}
              onClick={() => onSelect(activeButton === 'EisenhowerMatrix' ? null : 'EisenhowerMatrix')}
            >
              Matriz de Eisenhower
            </button>
            <button
              className={`add ${activeButton === 'Add' ? 'active' : ''}`}
              onClick={() => onSelect(activeButton === 'Add' ? null : 'Add')}
            >
              Adicionar
            </button>
          </>
        )}
        {activeButton === 'TaskTable' && (
          <button
            className={`task-table ${activeButton === 'TaskTable' ? 'active' : ''}`}
            onClick={() => onSelect(activeButton === 'TaskTable' ? null : 'TaskTable')}
          >
            Tabela de Tarefas
          </button>
        )}
        {activeButton === 'OneThreeFive' && (
          <>
            <button
              className={`task-table ${activeButton === 'TaskTable' ? 'active' : ''}`}
              onClick={() => onSelect(activeButton === 'TaskTable' ? null : 'TaskTable')}
            >
              Tabela de Tarefas
            </button>
            <button
              className={`one-three-five ${activeButton === 'OneThreeFive' ? 'active' : ''}`}
              onClick={() => onSelect(activeButton === 'OneThreeFive' ? null : 'OneThreeFive')}
            >
              1 - 3 - 5
            </button>
          </>
        )}
        {activeButton === 'EisenhowerMatrix' && (
          <>
            <button
              className={`task-table ${activeButton === 'TaskTable' ? 'active' : ''}`}
              onClick={() => onSelect(activeButton === 'TaskTable' ? null : 'TaskTable')}
            >
              Tabela de Tarefas
            </button>
            <button
              className={`one-three-five ${activeButton === 'OneThreeFive' ? 'active' : ''}`}
              onClick={() => onSelect(activeButton === 'OneThreeFive' ? null : 'OneThreeFive')}
            >
              1 - 3 - 5
            </button>
            <button
              className={`eisenhower-matrix ${activeButton === 'EisenhowerMatrix' ? 'active' : ''}`}
              onClick={() => onSelect(activeButton === 'EisenhowerMatrix' ? null : 'EisenhowerMatrix')}
            >
              Matriz de Eisenhower
            </button>
          </>
        )}
      </div>
      {activeButton && (
        <div className="active-component">
          {activeButton === 'TaskTable' && <TaskTable />}
          {activeButton === 'OneThreeFive' && <OneThreeFive />}
          {activeButton === 'EisenhowerMatrix' && <EisenhowerMatrix />}
          {activeButton === 'Add' && <Add />}
        </div>
      )}
      {activeButton && (
        <div className={`utils ${activeButton ? 'u-down' : ''}`}>
          {activeButton === 'TaskTable' && (
            <>
              <button
                className={`one-three-five ${activeButton === 'OneThreeFive' ? 'active' : ''}`}
                onClick={() => onSelect(activeButton === 'OneThreeFive' ? null : 'OneThreeFive')}
              >
                1 - 3 - 5
              </button>
              <button
                className={`eisenhower-matrix ${activeButton === 'EisenhowerMatrix' ? 'active' : ''}`}
                onClick={() => onSelect(activeButton === 'EisenhowerMatrix' ? null : 'EisenhowerMatrix')}
              >
                Matriz de Eisenhower
              </button>
              <button
                className={`add ${activeButton === 'Add' ? 'active' : ''}`}
                onClick={() => onSelect(activeButton === 'Add' ? null : 'Add')}
              >
                Adicionar
              </button>
            </>
          )}
          {activeButton === 'OneThreeFive' && (
            <>
              <button
                className={`eisenhower-matrix ${activeButton === 'EisenhowerMatrix' ? 'active' : ''}`}
                onClick={() => onSelect(activeButton === 'EisenhowerMatrix' ? null : 'EisenhowerMatrix')}
              >
                Matriz de Eisenhower
              </button>
              <button
                className={`add ${activeButton === 'Add' ? 'active' : ''}`}
                onClick={() => onSelect(activeButton === 'Add' ? null : 'Add')}
              >
                Adicionar
              </button>
            </>
          )}
          {activeButton === 'EisenhowerMatrix' && (
            <button
              className={`add ${activeButton === 'Add' ? 'active' : ''}`}
              onClick={() => onSelect(activeButton === 'Add' ? null : 'Add')}
            >
              Adicionar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Utils;
