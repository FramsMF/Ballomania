
(() => {
  "use strict";

  const SUPABASE_URL = window.TEACHER_SUPABASE_URL;
  const SUPABASE_KEY = window.TEACHER_SUPABASE_KEY;
  const STORAGE_BUCKET = "teacher-task-images";

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Не найдены настройки Supabase в teacher-config.js");
    return;
  }

  // ==========================================
  // SUPABASE
  // ==========================================

  async function callRPC(functionName, params = {}) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/${functionName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify(params)
      }
    );

    const text = await response.text();

    if (!response.ok) {
      console.error("Ошибка Supabase:", functionName, text);
      throw new Error(text || "Ошибка обращения к серверу");
    }

    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  function getImageUrl(task) {
    if (task.image_url) {
      return task.image_url;
    }

    if (task.image_path) {
      if (task.image_path.startsWith("http")) {
        return task.image_path;
      }

      return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${task.image_path}`;
    }

    return "";
  }

  // ==========================================
  // ПОИСК КНОПКИ "ЗАДАНИЯ"
  // ==========================================

  function findTasksButton() {
    const possibleIds = [
      "studentTasksButton",
      "tasksButton",
      "tasks-btn",
      "student-tasks-button",
      "openTasksButton"
    ];

    for (const id of possibleIds) {
      const element = document.getElementById(id);
      if (element) return element;
    }

    const buttons = Array.from(
      document.querySelectorAll("button")
    );

    return buttons.find(button => {
      const text = button.textContent.trim().toLowerCase();

      return (
        text === "задания" ||
        text === "📚 задания" ||
        text === "🎮 задания"
      );
    }) || null;
  }

  function createTasksButton() {
    const button = document.createElement("button");

    button.id = "studentTasksButton";
    button.type = "button";
    button.textContent = "📚 Задания";

    button.style.cssText = `
      position: fixed;
      top: 15px;
      left: 15px;
      z-index: 9998;
      padding: 12px 18px;
      border: 2px solid #ffff00;
      border-radius: 12px;
      background: #345995;
      color: #ffff00;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
    `;

    document.body.appendChild(button);

    return button;
  }

  // ==========================================
  // СОЗДАНИЕ ОКНА УЧЕНИЧЕСКИХ ЗАДАНИЙ
  // ==========================================

  const modal = document.createElement("div");
  modal.id = "studentTasksModal";

  modal.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0,0,0,0.82);
    padding: 20px;
    box-sizing: border-box;
    overflow-y: auto;
    align-items: center;
    justify-content: center;
  `;

  modal.innerHTML = `
    <div id="studentTasksWindow" style="
      width: 100%;
      max-width: 650px;
      max-height: 90vh;
      overflow-y: auto;
      background: #03032f;
      color: #ffff00;
      border: 3px solid #ffff00;
      border-radius: 18px;
      padding: 22px;
      box-sizing: border-box;
      font-family: Arial, sans-serif;
    ">

      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
      ">
        <h2 id="studentTasksHeading" style="margin: 0;">
          📚 Задания
        </h2>

        <button id="studentTasksClose" type="button" style="
          background: #ff7777;
          color: #03032f;
          border: none;
          border-radius: 10px;
          padding: 9px 14px;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
        ">✕</button>
      </div>

      <div id="studentTasksList"></div>

      <div id="studentSelectedTask" style="display: none;">

        <button id="studentBackToList" type="button" style="
          background: #345995;
          color: #ffff00;
          border: 1px solid #ffff00;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 18px;
          cursor: pointer;
          font-size: 15px;
        ">← К списку заданий</button>

        <h3 id="studentTaskTitle"></h3>

        <img id="studentTaskImage" alt="Изображение задания" style="
          display: none;
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 10px;
          margin: 10px auto;
        ">

        <div style="margin-top: 18px;">
          <label for="studentTaskAnswer" style="
            display: block;
            margin-bottom: 8px;
          ">Ваш ответ:</label>

          <input id="studentTaskAnswer" type="text" autocomplete="off" style="
            width: 100%;
            box-sizing: border-box;
            padding: 12px;
            border: 2px solid #459ff5;
            border-radius: 10px;
            font-size: 18px;
          ">
        </div>

        <button id="studentCheckAnswer" type="button" style="
          width: 100%;
          margin-top: 14px;
          padding: 13px;
          border: none;
          border-radius: 10px;
          background: #66ee94;
          color: #03032f;
          font-weight: bold;
          font-size: 17px;
          cursor: pointer;
        ">Проверить ответ</button>

        <div id="studentTaskMessage" style="
          margin-top: 15px;
          font-size: 17px;
          font-weight: bold;
          text-align: center;
        "></div>

        <button id="studentNextTask" type="button" style="
          display: none;
          width: 100%;
          margin-top: 12px;
          padding: 12px;
          border: 1px solid #ffff00;
          border-radius: 10px;
          background: #345995;
          color: #ffff00;
          font-size: 16px;
          cursor: pointer;
        ">Вернуться к заданиям</button>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  // ==========================================
  // ЭЛЕМЕНТЫ
  // ==========================================

  const tasksList = modal.querySelector("#studentTasksList");
  const selectedTaskBlock = modal.querySelector("#studentSelectedTask");
  const heading = modal.querySelector("#studentTasksHeading");

  const closeButton = modal.querySelector("#studentTasksClose");
  const backButton = modal.querySelector("#studentBackToList");

  const taskTitle = modal.querySelector("#studentTaskTitle");
  const taskImage = modal.querySelector("#studentTaskImage");

  const answerInput = modal.querySelector("#studentTaskAnswer");
  const checkButton = modal.querySelector("#studentCheckAnswer");
  const message = modal.querySelector("#studentTaskMessage");
  const nextButton = modal.querySelector("#studentNextTask");

  let tasks = [];
  let selectedTask = null;
  let answerCorrect = false;

  // ==========================================
  // ОТКРЫТИЕ И ЗАКРЫТИЕ
  // ==========================================

  function openModal() {
    modal.style.display = "flex";
    showTasksList();
    loadTasks();
  }

  function closeModal() {
    modal.style.display = "none";
  }

  closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && modal.style.display !== "none") {
      closeModal();
    }
  });

  // ==========================================
  // СПИСОК ЗАДАНИЙ
  // ==========================================

  function showTasksList() {
    heading.textContent = "📚 Задания";
    tasksList.style.display = "block";
    selectedTaskBlock.style.display = "none";
  }

  async function loadTasks() {
    tasksList.innerHTML = `
      <p style="text-align:center;">Загружаем задания...</p>
    `;

    try {
      const result = await callRPC("student_list_tasks");

      tasks = Array.isArray(result) ? result : [];

      renderTasks();

    } catch (error) {
      tasksList.innerHTML = `
        <p style="color:#ff7777;text-align:center;">
          Не удалось загрузить задания.<br>
          Попробуйте обновить страницу.
        </p>
      `;

      console.error(error);
    }
  }

  function renderTasks() {
    tasksList.style.display = "block";
    selectedTaskBlock.style.display = "none";

    heading.textContent = "📚 Выберите задание";

    if (!tasks.length) {
      tasksList.innerHTML = `
        <p style="text-align:center;">
          Пока преподаватель не добавил задания.
        </p>
      `;
      return;
    }

    tasksList.innerHTML = "";

    tasks.forEach((task, index) => {
      const number = task.task_number ?? (index + 1);

      const card = document.createElement("button");
      card.type = "button";

      card.style.cssText = `
        display: block;
        width: 100%;
        box-sizing: border-box;
        text-align: left;
        margin-bottom: 12px;
        padding: 16px;
        border: 2px solid #459ff5;
        border-radius: 12px;
        background: #345995;
        color: #ffff00;
        font-size: 17px;
        font-weight: bold;
        cursor: pointer;
      `;

      card.innerHTML = `
        <div>📝 Задание №${number}</div>
        <div style="
          font-size: 13px;
          font-weight: normal;
          margin-top: 6px;
          color: #ffffff;
        ">Нажмите, чтобы открыть</div>
      `;

      card.addEventListener("click", () => {
        openTask(task);
      });

      tasksList.appendChild(card);
    });
  }

  // ==========================================
  // ОТКРЫТИЕ ВЫБРАННОГО ЗАДАНИЯ
  // ==========================================

  function openTask(task) {
    selectedTask = task;
    answerCorrect = false;

    tasksList.style.display = "none";
    selectedTaskBlock.style.display = "block";

    heading.textContent = "📝 Задание";

    const number = task.task_number ?? "";

    taskTitle.textContent = `Задание №${number}`;

    answerInput.value = "";
    answerInput.disabled = false;

    checkButton.disabled = false;
    checkButton.style.display = "block";

    message.textContent = "";
    nextButton.style.display = "none";

    const imageUrl = getImageUrl(task);

    if (imageUrl) {
      taskImage.src = imageUrl;
      taskImage.style.display = "block";
    } else {
      taskImage.removeAttribute("src");
      taskImage.style.display = "none";
    }

    answerInput.focus();
  }

  // ==========================================
  // ПРОВЕРКА ОТВЕТА
  // ==========================================

  function isCorrectResult(result) {
    if (result === true) return true;
    if (result === false || result == null) return false;

    if (typeof result === "string") {
      const value = result.trim().toLowerCase();

      if (value === "true" || value === "correct") return true;
      if (value === "false" || value === "incorrect") return false;

      try {
        return isCorrectResult(JSON.parse(result));
      } catch {
        return false;
      }
    }

    if (typeof result === "object") {
      if ("correct" in result) return isCorrectResult(result.correct);
      if ("is_correct" in result) return isCorrectResult(result.is_correct);
      if ("success" in result) return isCorrectResult(result.success);
      if ("result" in result) return isCorrectResult(result.result);
    }

    return false;
  }

  async function checkAnswer() {
    if (!selectedTask || answerCorrect) return;

    const answer = answerInput.value.trim();

    if (!answer) {
      message.textContent = "Введите ответ.";
      message.style.color = "#ff7777";
      return;
    }

    checkButton.disabled = true;
    message.textContent = "Проверяем...";
    message.style.color = "#ffff00";

    try {
      const result = await callRPC(
        "student_check_task_answer",
        {
          p_task_number: Number(selectedTask.task_number),
          p_answer: answer
        }
      );

      if (isCorrectResult(result)) {
        answerCorrect = true;

        message.textContent = "✅ Правильно!";
        message.style.color = "#66ee94";

        answerInput.disabled = true;
        checkButton.style.display = "none";
        nextButton.style.display = "block";

      } else {
        message.textContent = "❌ Неверный ответ. Попробуйте ещё раз.";
        message.style.color = "#ff7777";

        checkButton.disabled = false;
        answerInput.focus();
      }

    } catch (error) {
      message.textContent = "Ошибка проверки. Попробуйте ещё раз.";
      message.style.color = "#ff7777";

      checkButton.disabled = false;
      console.error(error);
    }
  }

  checkButton.addEventListener("click", checkAnswer);

  answerInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      checkAnswer();
    }
  });

  // ==========================================
  // ВОЗВРАТ К СПИСКУ
  // ==========================================

  function backToTasks() {
    selectedTask = null;
    answerCorrect = false;
    showTasksList();
    renderTasks();
  }

  backButton.addEventListener("click", backToTasks);
  nextButton.addEventListener("click", backToTasks);

  // ==========================================
  // ПОДКЛЮЧЕНИЕ КНОПКИ
  // ==========================================

  function connectButton() {
    let button = findTasksButton();

    if (!button) {
      button = createTasksButton();
    }

    // Создаём чистую копию кнопки без старых обработчиков.
    const cleanButton = button.cloneNode(true);
    button.replaceWith(cleanButton);

    cleanButton.dataset.studentTasksConnected = "true";

    // Перехватываем нажатие на кнопку раньше остальных обработчиков.
    document.addEventListener("click", event => {
      const clickedButton = event.target.closest(
        "#studentTasksButton, #tasksButton, #tasks-btn, #student-tasks-button, #openTasksButton"
      );

      if (clickedButton !== cleanButton) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      openModal();
    }, true);
  }

  connectButton();

  console.log("Ученические задания подключены.");

})();
