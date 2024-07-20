// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import React, { useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import pt from 'date-fns/locale/pt';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { endOfWeek, endOfMonth, setHours, setMinutes } from 'date-fns';

import gtdData from '../../phrases/gtd.json';

registerLocale('pt', pt);

const GTDForm = ({ addTask, onClose, setSuccessMessage }) => {
    const [currentQuestion, setCurrentQuestion] = useState('Q1');
    const [answers, setAnswers] = useState({});
    const [customDate, setCustomDate] = useState(null);
    const [textAnswer, setTextAnswer] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleTextChange = (event) => {
        setTextAnswer(event.target.value);
    };

    const handleDateChange = (date) => {
        setCustomDate(date);
    };

    const handleTextSubmit = () => {
        if (textAnswer.trim() === '') {
            setErrorMessage('Por favor, preencha a descrição da tarefa.');
            return;
        }
        setAnswers({ ...answers, [currentQuestion]: textAnswer });
        setErrorMessage('');
        proceedToNextQuestion();
    };

    const handleDateSubmit = () => {
        if (!customDate) {
            setErrorMessage('Por favor, selecione uma data.');
            return;
        }
        setAnswers({ ...answers, [currentQuestion]: customDate });
        setCurrentQuestion('Q13');
        setShowDatePicker(false);
        setErrorMessage('');
    };

    const handleOptionChange = (option) => {
        let nextQuestion = gtdData[currentQuestion].answers[option];
        if (option === 'Hoje mesmo!') {
            const today = setMinutes(setHours(new Date(), 23), 59);
            setAnswers({ ...answers, [currentQuestion]: today });
            nextQuestion = 'Q13';
        } else if (option === 'Esta semana!') {
            const endOfWeekDate = setMinutes(setHours(endOfWeek(new Date()), 23), 59);
            setAnswers({ ...answers, [currentQuestion]: endOfWeekDate });
            nextQuestion = 'Q13';
        } else if (option === 'Este mês!') {
            const endOfMonthDate = setMinutes(setHours(endOfMonth(new Date()), 23), 59);
            setAnswers({ ...answers, [currentQuestion]: endOfMonthDate });
            nextQuestion = 'Q13';
        } else if (option === 'Customizar') {
            setShowDatePicker(true);
            return;
        }

        if (typeof nextQuestion === 'string') {
            setCurrentQuestion(nextQuestion);
        } else if (nextQuestion.conclusion) {
            setAnswers({ ...answers, conclusion: nextQuestion.conclusion });
        }
    };

    const proceedToNextQuestion = () => {
        const nextQuestion = gtdData[currentQuestion].answers === 'text' || gtdData[currentQuestion].answers === 'custom_date' ? 'Q2' : null;
        setCurrentQuestion(nextQuestion);
    };

    const currentData = gtdData[currentQuestion];
    const conclusion = answers.conclusion;

    const handleTaskSubmit = (confirmed) => {
        if (confirmed) {
            const task = {
                description: answers.Q1,
                deadline: answers.Q11,
                importance: conclusion.importante
            };
            console.log(task);
            addTask(task);
            setSuccessMessage(`Tarefa "${task.description}" adicionada com sucesso!`);
        }
        setCurrentQuestion('Q1');
        setAnswers({});
        setCustomDate(null);
        setTextAnswer('');
        setShowDatePicker(false);
        onClose();
    };

    const getPriorityLabel = (priority) => ['desconhecida', 'muito baixa', 'baixa', 'média', 'alta', 'muito alta'][priority] || 'desconhecida';

    return (
        <div className="gtd-form">
            {!conclusion ? (
                <div className="question-section">
                    <h2>{currentData.question}</h2>
                    {currentData.answers === 'text' ? (
                        <div className="text-input">
                            <input type="text" onChange={handleTextChange} placeholder='Descreva a tarefa…' value={textAnswer} />
                            {errorMessage && <p className="error-m">{errorMessage}</p>}
                            <button onClick={handleTextSubmit}>Próximo</button>
                        </div>
                    ) : showDatePicker ? (
                        <div className="date-input">
                            <DatePicker
                                selected={customDate}
                                onChange={handleDateChange}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                dateFormat="Pp"
                                locale="pt"
                                minDate={new Date()}
                                minTime={setMinutes(new Date(), new Date().getMinutes() + 10)}
                                maxTime={setHours(setMinutes(new Date(), 59), 23)}
                                placeholderText="Selecione a data e a hora"
                            />
                            {errorMessage && <p className="error-m">{errorMessage}</p>}
                            <button onClick={handleDateSubmit}>Próximo</button>
                        </div>
                    ) : (
                        <div className="options">
                            {Object.keys(currentData.answers).map((option) => (
                                <button key={option} onClick={() => handleOptionChange(option)}>
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="conclusion-section">
                    {typeof conclusion === 'string' ? (
                        <>
                            <p>{conclusion}</p>
                            <button className='cancel-button' onClick={() => handleTaskSubmit(false)}>OK</button>
                        </>
                    ) : (
                        <div className="task-summary">
                            <p>Pretende adicionar a tarefa "{answers.Q1}", a ser feita até {answers.Q11 && format(answers.Q11, "HH:mm 'de' dd 'de' MMMM 'de' yyyy", { locale: ptBR })}, com prioridade {getPriorityLabel(conclusion.importante)}</p>
                            <button onClick={() => handleTaskSubmit(true)}>Sim</button>
                            <button className='cancel-button' onClick={() => handleTaskSubmit(false)}>Não</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GTDForm;
