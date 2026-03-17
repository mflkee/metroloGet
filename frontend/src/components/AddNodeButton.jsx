import React, { useState, useRef } from 'react';

function AddNodeButton({ onAdd }) {
  const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Создаем рефы для полей ввода
  const nameInputRef = useRef(null);
  const descriptionInputRef = useRef(null);

  // Обработчик отправки формы
  const handleSubmit = async () => {
    if (name.trim() === '') return; // Проверяем, что название не пустое
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      await onAdd({
        name: name.trim(),
        description: description.trim(),
      });
      setIsModalOpen(false); // Закрываем модальное окно
      setName('');
      setDescription('');
    } catch (error) {
      setErrorMessage(error.message || 'Не удалось создать узел');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Обработчик закрытия модального окна
  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    setIsModalOpen(false);
    setName('');
    setDescription('');
    setErrorMessage('');
  };

  // Обработчик открытия модального окна
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setErrorMessage('');
    // Устанавливаем фокус на поле ввода "Название" после открытия модального окна
    setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, 0);
  };

  // Обработчик нажатия клавиш в поле "Название"
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Предотвращаем стандартное поведение (например, отправку формы)
      if (descriptionInputRef.current) {
        descriptionInputRef.current.focus(); // Перемещаем фокус на поле "Описание"
      }
    }
  };

  // Обработчик нажатия клавиш в поле "Описание"
  const handleDescriptionKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Предотвращаем стандартное поведение
      handleSubmit(); // Добавляем карточку
    }
  };

  return (
    <>
      {/* Кнопка с плюсом */}
      <div className="add-node-button" onClick={handleOpenModal}>
        <span className="plus-icon">+</span>
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className={`modal-overlay active`}>
          <div className="modal-content">
            <input
              type="text"
              placeholder="Название"
              value={name}
              onChange={(e) => setName(e.target.value)}
              ref={nameInputRef} // Привязываем реф к полю ввода "Название"
              onKeyDown={handleNameKeyDown} // Обработчик нажатий клавиш
            />
            <input
              type="text"
              placeholder="Описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              ref={descriptionInputRef} // Привязываем реф к полю ввода "Описание"
              onKeyDown={handleDescriptionKeyDown} // Обработчик нажатий клавиш
            />
            {errorMessage ? (
              <p className="modal-error-message">{errorMessage}</p>
            ) : null}
            <div className="modal-buttons">
              <button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Да'}
              </button>
              <button onClick={handleClose} disabled={isSubmitting}>Нет</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddNodeButton;
