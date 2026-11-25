
(() => {
    "use strict";

    const SUPABASE_URL = window.TEACHER_SUPABASE_URL;
    const SUPABASE_KEY = window.TEACHER_SUPABASE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error("Балломания: настройки Supabase не найдены.");
        return;
    }

    let tasks = [];
    let currentIndex = 0;
    let isChecking = false;

    // ---------- ЗАПРОСЫ К SUPABASE ----------

    async function rpc(functionName, params = {}) {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/rpc/${functionName}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                },
                body: JSON.stringify(params)
            }
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(
                data?.message || data?.details || "Ошибка запроса к серверу"
            );
        }

        return data;
    }

    // ---------- СОЗДАНИЕ ИНТЕРФЕЙСА ----------

    function createInterface() {
        if (document.getElementById("studentTasksButton")) return;

        const button = document.createElement("button");
        button.id = "studentTasksButton";
        button.textContent = "🎮 Задания преподавателя";

        Object.assign(button.style, {
            position: "fixed",
            right: "20px",
            bottom: "20px",
            zIndex: "99998",
            padding: "14px 20px",
            border: "none",
            borderRadius: "14px",
            background: "#3878e8",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(0,0,0,.2)"
        });

        button.addEventListener("click", openStudentTasks);
        document.body.appendChild(button);

        const overlay = document.createElement("div");
        overlay.id = "studentTasksOverlay";

        Object.assign(overlay.style, {
            display: "none",
            position: "fixed",
            inset: "0",
            zIndex: "99999",
            background: "rgba(0,0,0,.72)",
            justifyContent: "center",
            alignItems: "center",
            padding: "15px",
            boxSizing: "border-box"
        });

        overlay.innerHTML = `
            <div id="studentTasksWindow">
                <button id="studentTasksClose" title="Закрыть">✕</button>

                <div id="studentTasksContent">
                    <h2>Задания преподавателя</h2>
                    <p>Загрузка заданий...</p>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const style = document.createElement("style");
        style.textContent = `
            #studentTasksWindow {
                background: #fff;
                color: #222;
                width: 100%;
                max-width: 750px;
                max-height: 90vh;
                overflow-y: auto;
                border-radius: 20px;
                padding: 25px;
                box-sizing: border-box;
                position: relative;
                font-family: Arial, sans-serif;
            }

            #studentTasksClose {
                position: sticky;
                float: right;
                top: 0;
                border: none;
                background: #eeeeee;
                border-radius: 50%;
                width: 38px;
                height: 38px;
                font-size: 20px;
                cursor: pointer;
                z-index: 2;
            }

            #studentTasksContent {
                text-align: center;
                clear: both;
            }

            #studentTasksContent h2 {
                margin: 10px 0 20px;
            }

            #studentTaskImage {
                display: block;
                max-width: 100%;
                max-height: 55vh;
                margin: 15px auto;
                object-fit: contain;
                border-radius: 10px;
            }

            #studentTaskAnswer {
                width: 100%;
                max-width: 400px;
                padding: 13px;
                font-size: 18px;
                box-sizing: border-box;
                border: 2px solid #ccc;
                border-radius: 10px;
                margin: 10px 0;
            }

            .studentTaskButton {
                padding: 12px 20px;
                margin: 7px;
                border: none;
                border-radius: 10px;
                background: #3878e8;
                color: white;
                font-size: 16px;
                cursor: pointer;
            }

            .studentTaskButton:disabled {
                opacity: .6;
                cursor: wait;
            }

            #studentTaskResult {
                font-size: 18px;
                font-weight: bold;
                margin: 15px 0;
            }

            @media (max-width: 600px) {
                #studentTasksWindow {
                    padding: 15px;
                    max-height: 95vh;
                }

                #studentTasksButton {
                    right: 10px !important;
                    bottom: 10px !important;
                    font-size: 13px !important;
                    padding: 12px !important;
                }
            }
        `;

        document.head.appendChild(style);

        document.getElementById("studentTasksClose")
            .addEventListener("click", closeStudentTasks);

        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                closeStudentTasks();
            }
        });
    }

    // ---------- ОТКРЫТИЕ ОКНА ----------

    async function openStudentTasks() {
        const overlay = document.getElementById("studentTasksOverlay");
        const content = document.getElementById("studentTasksContent");

        overlay.style.display = "flex";

        content.innerHTML = `
            <h2>Задания преподавателя</h2>
            <p>Загружаем задания...</p>
        `;

        try {
            const result = await rpc("student_list_tasks");

            tasks = Array.isArray(result) ? result : [];

            if (!tasks.length) {
                content.innerHTML = `
                    <h2>Задания преподавателя</h2>
                    <p>Пока преподаватель не добавил задания.</p>
                `;
                return;
            }

            currentIndex = 0;
            showTask();

        } catch (error) {
            console.error(error);

            content.innerHTML = `
                <h2>Не удалось загрузить задания</h2>
                <p>${escapeHTML(error.message)}</p>
                <button class="studentTaskButton" id="studentTasksRetry">
                    Повторить
                </button>
            `;

            document.getElementById("studentTasksRetry")
                .addEventListener("click", openStudentTasks);
        }
    }

    // ---------- ПОКАЗ ЗАДАНИЯ ----------

    function showTask() {
        const content = document.getElementById("studentTasksContent");

        if (currentIndex >= tasks.length) {
            showCompletion();
            return;
        }

        const task = tasks[currentIndex];

        isChecking = false;

        content.innerHTML = `
            <h2>Задания преподавателя</h2>

            <p>
                Задание ${currentIndex + 1} из ${tasks.length}
            </p>

            <div style="
                height: 8px;
                background: #e5e5e5;
                border-radius: 10px;
                overflow: hidden;
                margin: 15px 0;
            ">
                <div style="
                    width: ${((currentIndex + 1) / tasks.length) * 100}%;
                    height: 100%;
                    background: #3878e8;
                "></div>
            </div>

            <h3>Задание №${escapeHTML(task.task_number)}</h3>

            <img
                id="studentTaskImage"
                src="${escapeHTML(task.image_url || "")}"
                alt="Изображение задания"
            >

            <input
                id="studentTaskAnswer"
                type="text"
                placeholder="Введите ответ"
                autocomplete="off"
            >

            <div id="studentTaskResult"></div>

            <button class="studentTaskButton" id="studentTaskCheck">
                Проверить ответ
            </button>

            <button
                class="studentTaskButton"
                id="studentTaskNext"
                style="display:none"
            >
                Следующее задание →
            </button>
        `;

        const answerInput = document.getElementById("studentTaskAnswer");
        const checkButton = document.getElementById("studentTaskCheck");

        checkButton.addEventListener("click", checkAnswer);

        answerInput.addEventListener("keydown", event => {
            if (event.key === "Enter" && !isChecking) {
                checkAnswer();
            }
        });

        answerInput.focus();

        document.getElementById("studentTaskNext")
            .addEventListener("click", () => {
                currentIndex++;
                showTask();
            });
    }

    // ---------- ПРОВЕРКА ОТВЕТА ----------

    async function checkAnswer() {
        if (isChecking) return;

        const input = document.getElementById("studentTaskAnswer");
        const checkButton = document.getElementById("studentTaskCheck");
        const result = document.getElementById("studentTaskResult");
        const nextButton = document.getElementById("studentTaskNext");

        const answer = input.value.trim();

        if (!answer) {
            result.textContent = "Сначала введи ответ.";
            result.style.color = "#d97706";
            input.focus();
            return;
        }

        isChecking = true;
        checkButton.disabled = true;
        checkButton.textContent = "Проверяем...";
        result.textContent = "";

        try {
            const task = tasks[currentIndex];

            const response = await rpc("student_check_task_answer", {
                p_task_number: Number(task.task_number),
                p_answer: answer
            });

            const correct = parseCorrectResult(response);

            if (correct === true) {
                result.textContent = "✅ Правильно!";
                result.style.color = "#16803c";

                input.disabled = true;
                checkButton.style.display = "none";
                nextButton.style.display = "inline-block";

            } else if (correct === false) {
                result.textContent = "❌ Неправильно. Попробуй ещё раз.";
                result.style.color = "#d62828";

                input.focus();
                input.select();

            } else {
                throw new Error(
                    "Сервер вернул неожиданный результат проверки."
                );
            }

        } catch (error) {
            console.error(error);

            result.textContent =
                "Не удалось проверить ответ. Попробуй ещё раз.";

            result.style.color = "#d97706";

        } finally {
            isChecking = false;

            if (checkButton.style.display !== "none") {
                checkButton.disabled = false;
                checkButton.textContent = "Проверить ответ";
            }
        }
    }

    // Преобразуем разные форматы ответа Supabase в true/false
    function parseCorrectResult(data) {
        if (typeof data === "boolean") return data;

        if (typeof data === "string") {
            if (data === "true") return true;
            if (data === "false") return false;

            try {
                data = JSON.parse(data);
            } catch {
                return null;
            }
        }

        if (typeof data === "number") {
            if (data === 1) return true;
            if (data === 0) return false;
        }

        if (data && typeof data === "object") {
            if (typeof data.correct === "boolean") {
                return data.correct;
            }

            if (typeof data.is_correct === "boolean") {
                return data.is_correct;
            }

            if (typeof data.success === "boolean") {
                return data.success;
            }
        }

        return null;
    }

    // ---------- ЗАВЕРШЕНИЕ ----------

    function showCompletion() {
        const content = document.getElementById("studentTasksContent");

        content.innerHTML = `
            <h2>🎉 Все задания выполнены!</h2>

            <p>
                Ты прошёл все ${tasks.length} заданий преподавателя.
            </p>

            <button class="studentTaskButton" id="studentTasksRestart">
                Пройти ещё раз
            </button>
        `;

        document.getElementById("studentTasksRestart")
            .addEventListener("click", () => {
                currentIndex = 0;
                showTask();
            });
    }

    // ---------- ЗАКРЫТИЕ ----------

    function closeStudentTasks() {
        document.getElementById("studentTasksOverlay").style.display = "none";
    }

    // ---------- ЗАЩИТА ТЕКСТА ----------

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    // ---------- ЗАПУСК ----------

    function init() {
        createInterface();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
