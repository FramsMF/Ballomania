/* =========================================================
   БАЛЛОМАНИЯ — ИНТЕРФЕЙС ПРЕПОДАВАТЕЛЯ
   Файл: teacher.js
   ========================================================= */

(() => {
    "use strict";

    // -------------------------------------------------------
    // 1. НАСТРОЙКИ SUPABASE
    // -------------------------------------------------------

    const SUPABASE_URL = window.TEACHER_SUPABASE_URL;
    const SUPABASE_KEY = window.TEACHER_SUPABASE_KEY;

    const BUCKET = "teacher-task-images";

    // -------------------------------------------------------
    // 2. ПРОВЕРКА ПОДКЛЮЧЕНИЯ
    // -------------------------------------------------------

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error("Teacher.js: настройки Supabase не найдены.");
        return;
    }

    // -------------------------------------------------------
    // 3. СОЗДАНИЕ ИНТЕРФЕЙСА
    // -------------------------------------------------------

    const style = document.createElement("style");

    style.textContent = `
        #teacher-open-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9998;
            padding: 13px 22px;
            border: none;
            border-radius: 12px;
            background: #3b82f6;
            color: white;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(0,0,0,.2);
        }

        #teacher-open-button:hover {
            background: #2563eb;
        }

        #teacher-overlay {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: rgba(0,0,0,.65);
            overflow-y: auto;
            padding: 20px;
            box-sizing: border-box;
        }

        #teacher-overlay.open {
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }

        #teacher-window {
            width: 100%;
            max-width: 1000px;
            margin: 20px auto;
            padding: 25px;
            box-sizing: border-box;
            background: #ffffff;
            color: #222;
            border-radius: 16px;
            font-family: Arial, sans-serif;
        }

        #teacher-window * {
            box-sizing: border-box;
        }

        .teacher-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
        }

        .teacher-header h2 {
            margin: 0;
            font-size: 25px;
        }

        .teacher-close {
            border: none;
            background: #eeeeee;
            border-radius: 8px;
            padding: 10px 15px;
            font-size: 20px;
            cursor: pointer;
        }

        .teacher-tabs {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
        }

        .teacher-tab {
            border: none;
            border-radius: 8px;
            padding: 12px 18px;
            cursor: pointer;
            background: #e5e7eb;
            font-size: 15px;
        }

        .teacher-tab.active {
            background: #3b82f6;
            color: white;
        }

        .teacher-section {
            display: none;
        }

        .teacher-section.active {
            display: block;
        }

        .teacher-card {
            border: 1px solid #ddd;
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 15px;
            background: #fafafa;
        }

        .teacher-card h3 {
            margin-top: 0;
        }

        .teacher-field {
            display: flex;
            flex-direction: column;
            gap: 7px;
            margin-bottom: 15px;
        }

        .teacher-field label {
            font-weight: bold;
        }

        .teacher-field input,
        .teacher-field textarea {
            width: 100%;
            padding: 11px;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 15px;
        }

        .teacher-field input[type="file"] {
            background: white;
        }

        .teacher-preview {
            max-width: 100%;
            max-height: 300px;
            display: block;
            margin-top: 10px;
            border-radius: 8px;
        }

        .teacher-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }

        .teacher-action {
            border: none;
            border-radius: 8px;
            padding: 12px 18px;
            font-size: 15px;
            cursor: pointer;
            background: #3b82f6;
            color: white;
        }

        .teacher-action:hover {
            opacity: .9;
        }

        .teacher-action.secondary {
            background: #6b7280;
        }

        .teacher-action.danger {
            background: #dc2626;
        }

        .teacher-action.success {
            background: #16a34a;
        }

        .teacher-status {
            margin-top: 15px;
            padding: 12px;
            border-radius: 8px;
            display: none;
            white-space: pre-wrap;
        }

        .teacher-status.show {
            display: block;
        }

        .teacher-status.error {
            background: #fee2e2;
            color: #991b1b;
        }

        .teacher-status.success {
            background: #dcfce7;
            color: #166534;
        }

        .teacher-status.info {
            background: #dbeafe;
            color: #1e40af;
        }

        .teacher-task-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
            gap: 15px;
        }

        .teacher-existing-task {
            border: 1px solid #ddd;
            border-radius: 12px;
            overflow: hidden;
            background: white;
        }

        .teacher-existing-task img {
            display: block;
            width: 100%;
            max-height: 200px;
            object-fit: contain;
            background: #f3f4f6;
        }

        .teacher-existing-task-content {
            padding: 12px;
        }

        .teacher-existing-task-content h3 {
            margin: 0 0 10px;
        }

        .teacher-login {
            max-width: 400px;
            margin: 30px auto;
        }

        .teacher-login input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border-radius: 8px;
            border: 1px solid #ccc;
            font-size: 16px;
        }

        .teacher-empty {
            padding: 20px;
            text-align: center;
            color: #666;
        }

        @media (max-width: 600px) {
            #teacher-overlay {
                padding: 8px;
            }

            #teacher-window {
                padding: 15px;
                margin: 8px auto;
            }

            .teacher-header h2 {
                font-size: 20px;
            }

            #teacher-open-button {
                right: 10px;
                bottom: 10px;
            }
        }
    `;

    document.head.appendChild(style);

    // Кнопка открытия

    const openButton = document.createElement("button");

    openButton.id = "teacher-open-button";
    openButton.textContent = "👩‍🏫 Преподаватель";

    document.body.appendChild(openButton);

    // Основная панель

    const overlay = document.createElement("div");

    overlay.id = "teacher-overlay";

    overlay.innerHTML = `
        <div id="teacher-window">

            <div class="teacher-header">
                <h2>👩‍🏫 Панель преподавателя</h2>
                <button class="teacher-close" id="teacher-close">
                    ✕
                </button>
            </div>

            <div id="teacher-login-section">

                <div class="teacher-login">

                    <h3>Вход для преподавателя</h3>

                    <p>
                        Введите пароль для доступа к управлению заданиями.
                    </p>

                    <input
                        type="password"
                        id="teacher-password"
                        placeholder="Пароль"
                        autocomplete="off"
                    >

                    <button
                        class="teacher-action"
                        id="teacher-login-button"
                    >
                        Войти
                    </button>

                    <div
                        class="teacher-status"
                        id="teacher-login-status"
                    ></div>

                </div>

            </div>

            <div id="teacher-admin-section" style="display:none">

                <div class="teacher-tabs">

                    <button
                        class="teacher-tab active"
                        data-tab="add"
                    >
                        ➕ Добавить задания
                    </button>

                    <button
                        class="teacher-tab"
                        data-tab="list"
                    >
                        📋 Список заданий
                    </button>

                </div>

                <div
                    class="teacher-section active"
                    id="teacher-section-add"
                >

                    <h3>Добавление заданий</h3>

                    <p>
                        Добавь номера заданий, изображения и ответы.
                        Можно подготовить несколько заданий перед сохранением.
                    </p>

                    <div id="teacher-new-tasks"></div>

                    <div class="teacher-buttons">

                        <button
                            class="teacher-action secondary"
                            id="teacher-add-task"
                        >
                            ➕ Добавить задание
                        </button>

                        <button
                            class="teacher-action success"
                            id="teacher-save-tasks"
                        >
                            💾 Сохранить все задания
                        </button>

                    </div>

                    <div
                        class="teacher-status"
                        id="teacher-save-status"
                    ></div>

                </div>

                <div
                    class="teacher-section"
                    id="teacher-section-list"
                >

                    <h3>Сохранённые задания</h3>

                    <button
                        class="teacher-action secondary"
                        id="teacher-refresh-tasks"
                    >
                        🔄 Обновить список
                    </button>

                    <div
                        class="teacher-task-list"
                        id="teacher-existing-tasks"
                    ></div>

                    <div
                        class="teacher-status"
                        id="teacher-list-status"
                    ></div>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(overlay);

    // -------------------------------------------------------
    // 4. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // -------------------------------------------------------

    const $ = (id) => document.getElementById(id);

    function showStatus(element, message, type = "info") {
        element.textContent = message;
        element.className = `teacher-status show ${type}`;
    }

    function clearStatus(element) {
        element.textContent = "";
        element.className = "teacher-status";
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char]));
    }

    // -------------------------------------------------------
    // 5. ЗАПРОСЫ К SUPABASE
    // -------------------------------------------------------

    async function supabaseRPC(functionName, data) {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/rpc/${functionName}`,
            {
                method: "POST",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        const resultText = await response.text();

        let result;

        try {
            result = resultText ? JSON.parse(resultText) : null;
        } catch {
            result = resultText;
        }

        if (!response.ok) {
            throw new Error(
                result?.message ||
                result?.error ||
                resultText ||
                `Ошибка Supabase: ${response.status}`
            );
        }

        return result;
    }

    // -------------------------------------------------------
    // 6. ЗАГРУЗКА ИЗОБРАЖЕНИЙ
    // -------------------------------------------------------

    async function uploadImage(file) {
        if (!file) {
            throw new Error("Не выбрано изображение.");
        }

        if (!file.type.startsWith("image/")) {
            throw new Error("Можно загружать только изображения.");
        }

        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
            throw new Error("Размер изображения не должен превышать 10 МБ.");
        }

        const extension =
            file.name.split(".").pop()?.toLowerCase() || "jpg";

        const uniqueName =
            `${Date.now()}_${crypto.randomUUID()}.${extension}`;

        const path = `tasks/${uniqueName}`;

        const response = await fetch(
            `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
            {
                method: "POST",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": file.type,
                    "x-upsert": "false"
                },

                body: file
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `Не удалось загрузить изображение: ${errorText}`
            );
        }

        return path;
    }

    // -------------------------------------------------------
    // 7. ДОБАВЛЕНИЕ КАРТОЧКИ НОВОГО ЗАДАНИЯ
    // -------------------------------------------------------

    let newTaskCounter = 0;

    function addNewTaskCard() {
        newTaskCounter++;

        const card = document.createElement("div");

        card.className = "teacher-card";
        card.dataset.taskCard = "true";

        card.innerHTML = `
            <h3>Новое задание</h3>

            <div class="teacher-field">

                <label>
                    Номер задания
                </label>

                <input
                    type="number"
                    class="teacher-task-number"
                    min="1"
                    placeholder="Например: 1"
                >

            </div>

            <div class="teacher-field">

                <label>
                    Изображение задания
                </label>

                <input
                    type="file"
                    class="teacher-task-image"
                    accept="image/*"
                >

                <img
                    class="teacher-preview"
                    style="display:none"
                    alt="Предпросмотр задания"
                >

            </div>

            <div class="teacher-field">

                <label>
                    Правильный ответ
                </label>

                <input
                    type="text"
                    class="teacher-task-answer"
                    placeholder="Введите правильный ответ"
                >

            </div>

            <div class="teacher-buttons">

                <button
                    class="teacher-action danger teacher-remove-task"
                >
                    🗑 Удалить задание
                </button>

            </div>
        `;

        const fileInput = card.querySelector(".teacher-task-image");
        const preview = card.querySelector(".teacher-preview");

        fileInput.addEventListener("change", () => {
            const file = fileInput.files?.[0];

            if (!file) {
                preview.style.display = "none";
                preview.removeAttribute("src");
                return;
            }

            preview.src = URL.createObjectURL(file);
            preview.style.display = "block";
        });

        card.querySelector(".teacher-remove-task").addEventListener(
            "click",
            () => {
                card.remove();
            }
        );

        $("teacher-new-tasks").appendChild(card);
    }

    // -------------------------------------------------------
    // 8. СОХРАНЕНИЕ ЗАДАНИЙ
    // -------------------------------------------------------

    async function saveTasks() {
        const status = $("teacher-save-status");

        clearStatus(status);

        const cards = [
            ...$("teacher-new-tasks").querySelectorAll("[data-task-card]")
        ];

        if (cards.length === 0) {
            showStatus(
                status,
                "Сначала добавь хотя бы одно задание.",
                "error"
            );

            return;
        }

        const preparedTasks = [];

        const numbers = new Set();

        // Проверяем все карточки до загрузки

        for (const card of cards) {
            const numberInput = card.querySelector(".teacher-task-number");
            const imageInput = card.querySelector(".teacher-task-image");
            const answerInput = card.querySelector(".teacher-task-answer");

            const number = Number(numberInput.value);
            const file = imageInput.files?.[0];
            const answer = answerInput.value.trim();

            if (!Number.isInteger(number) || number < 1) {
                showStatus(
                    status,
                    "У каждого задания должен быть корректный номер.",
                    "error"
                );

                numberInput.focus();
                return;
            }

            if (numbers.has(number)) {
                showStatus(
                    status,
                    `Номер задания ${number} указан несколько раз.`,
                    "error"
                );

                numberInput.focus();
                return;
            }

            numbers.add(number);

            if (!file) {
                showStatus(
                    status,
                    `У задания №${number} не выбрано изображение.`,
                    "error"
                );

                imageInput.focus();
                return;
            }

            if (!answer) {
                showStatus(
                    status,
                    `У задания №${number} не указан ответ.`,
                    "error"
                );

                answerInput.focus();
                return;
            }

            preparedTasks.push({
                number,
                file,
                answer
            });
        }

        const saveButton = $("teacher-save-tasks");

        saveButton.disabled = true;
        saveButton.textContent = "⏳ Сохранение...";

        try {
            const tasksToSave = [];

            // Загружаем изображения

            for (let i = 0; i < preparedTasks.length; i++) {
                const task = preparedTasks[i];

                showStatus(
                    status,
                    `Загрузка изображения ${i + 1} из ${preparedTasks.length}...`,
                    "info"
                );

                const imagePath = await uploadImage(task.file);

                tasksToSave.push({
                    task_number: task.number,
                    image_path: imagePath,
                    correct_answer: task.answer
                });
            }

            // Сохранение данных через серверную функцию Supabase.
            // Эта функция будет создана следующим этапом в SQL.

            showStatus(
                status,
                "Изображения загружены. Сохраняю задания в базу...",
                "info"
            );

            await supabaseRPC("teacher_save_tasks", {
                p_password: $("teacher-password").value,
                p_tasks: tasksToSave
            });

            showStatus(
                status,
                `Успешно сохранено заданий: ${tasksToSave.length}.`,
                "success"
            );

            // Очищаем форму после успешного сохранения

            $("teacher-new-tasks").innerHTML = "";

            // Обновляем список заданий

            await loadExistingTasks();

        } catch (error) {
            console.error("Ошибка сохранения заданий:", error);

            showStatus(
                status,
                error.message || "Не удалось сохранить задания.",
                "error"
            );

        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "💾 Сохранить все задания";
        }
    }

    // -------------------------------------------------------
    // 9. ЗАГРУЗКА СПИСКА СОХРАНЁННЫХ ЗАДАНИЙ
    // -------------------------------------------------------

    async function loadExistingTasks() {
        const list = $("teacher-existing-tasks");
        const status = $("teacher-list-status");

        list.innerHTML = "";

        clearStatus(status);

        showStatus(status, "Загружаю список заданий...", "info");

        try {
            const tasks = await supabaseRPC("teacher_list_tasks", {
                p_password: $("teacher-password").value
            });

            if (!Array.isArray(tasks) || tasks.length === 0) {
                list.innerHTML = `
                    <div class="teacher-empty">
                        Пока нет сохранённых заданий.
                    </div>
                `;

                showStatus(status, "Список заданий пуст.", "info");

                return;
            }

            tasks.sort(
                (a, b) => a.task_number - b.task_number
            );

            for (const task of tasks) {
                const card = document.createElement("div");

                card.className = "teacher-existing-task";

                card.innerHTML = `
                    ${
                        task.image_url
                        ? `<img src="${escapeHTML(task.image_url)}"
                               alt="Задание ${escapeHTML(task.task_number)}">`
                        : ""
                    }

                    <div class="teacher-existing-task-content">

                        <h3>
                            Задание №${escapeHTML(task.task_number)}
                        </h3>

                        <button
                            class="teacher-action danger teacher-delete-existing"
                        >
                            🗑 Удалить
                        </button>

                    </div>
                `;

                card.querySelector(".teacher-delete-existing")
                    .addEventListener("click", async () => {

                        const confirmed = confirm(
                            `Удалить задание №${task.task_number}?`
                        );

                        if (!confirmed) return;

                        try {
                            await supabaseRPC("teacher_delete_task", {
                                p_password: $("teacher-password").value,
                                p_task_number: task.task_number
                            });

                            await loadExistingTasks();

                        } catch (error) {
                            alert(
                                "Ошибка удаления: " + error.message
                            );
                        }
                    });

                list.appendChild(card);
            }

            showStatus(
                status,
                `Загружено заданий: ${tasks.length}.`,
                "success"
            );

        } catch (error) {
            console.error(error);

            showStatus(
                status,
                error.message || "Ошибка загрузки списка заданий.",
                "error"
            );
        }
    }

    // -------------------------------------------------------
    // 10. ВХОД ПРЕПОДАВАТЕЛЯ
    // -------------------------------------------------------

    async function teacherLogin() {
        const password = $("teacher-password").value.trim();
        const status = $("teacher-login-status");

        clearStatus(status);

        if (!password) {
            showStatus(
                status,
                "Введите пароль.",
                "error"
            );

            return;
        }

        const loginButton = $("teacher-login-button");

        loginButton.disabled = true;
        loginButton.textContent = "Проверка...";

        try {
            // Проверка пароля будет выполняться на сервере.
            // Здесь клиент не проверяет пароль самостоятельно.

            await supabaseRPC("teacher_check_password", {
                p_password: password
            });

            $("teacher-login-section").style.display = "none";
            $("teacher-admin-section").style.display = "block";

            clearStatus(status);

            await loadExistingTasks();

        } catch (error) {
            showStatus(
                status,
                "Неверный пароль или серверная функция ещё не настроена.",
                "error"
            );

            console.error(error);

        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "Войти";
        }
    }

    // -------------------------------------------------------
    // 11. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
    // -------------------------------------------------------

    function switchTab(tabName) {
        document.querySelectorAll(".teacher-tab").forEach(tab => {
            tab.classList.toggle(
                "active",
                tab.dataset.tab === tabName
            );
        });

        document.querySelectorAll(".teacher-section").forEach(section => {
            section.classList.toggle(
                "active",
                section.id === `teacher-section-${tabName}`
            );
        });
    }

    // -------------------------------------------------------
    // 12. ОТКРЫТИЕ И ЗАКРЫТИЕ ПАНЕЛИ
    // -------------------------------------------------------

    function openTeacherPanel() {
        overlay.classList.add("open");
    }

    function closeTeacherPanel() {
        overlay.classList.remove("open");
    }

    openButton.addEventListener("click", openTeacherPanel);

    $("teacher-close").addEventListener("click", closeTeacherPanel);

    overlay.addEventListener("click", event => {
        if (event.target === overlay) {
            closeTeacherPanel();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeTeacherPanel();
        }
    });

    // -------------------------------------------------------
    // 13. ПОДКЛЮЧЕНИЕ КНОПОК
    // -------------------------------------------------------

    $("teacher-login-button").addEventListener(
        "click",
        teacherLogin
    );

    $("teacher-password").addEventListener("keydown", event => {
        if (event.key === "Enter") {
            teacherLogin();
        }
    });

    $("teacher-add-task").addEventListener(
        "click",
        addNewTaskCard
    );

    $("teacher-save-tasks").addEventListener(
        "click",
        saveTasks
    );

    $("teacher-refresh-tasks").addEventListener(
        "click",
        loadExistingTasks
    );

    document.querySelectorAll(".teacher-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            switchTab(tab.dataset.tab);
        });
    });

    // -------------------------------------------------------
    // 14. ПЕРВАЯ КАРТОЧКА
    // -------------------------------------------------------

    addNewTaskCard();

    console.log("Teacher.js успешно подключён.");

})();
