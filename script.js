(() => {
  "use strict";

  const VALUES = [50, 100, 150, 200, 250];
  const ROW_NUMBERS = [1, 2, 3, 4, 7, 9];

  const REWARD_API_URL =
    "https://juchryyubxkuapnaqelj.supabase.co/rest/v1/rpc/mp_issue_ballomania_code";

  const REWARD_PUBLIC_KEY =
    "sb_publishable_l75mr1kAzXwX6aPUEvruEA_GfmLKIE-";

  /*
    ✅ ЗДЕСЬ ЗАПОЛНЯТЬ ВОПРОСЫ И ОТВЕТЫ

    Пример:

    "50.7": {
      question: "Сколько будет 2 + 2?",
      answers: ["4", "четыре"]
    }

    "50.7" означает:
    - строка №7;
    - номинал 50;
    - картинка 50.7.png.

    В answers можно перечислить несколько вариантов.
    Первый вариант показывается после ошибки.

    Эмодзи в сам ответ добавлять НЕ нужно.

    Для переноса строки в вопросе используйте \n.
  */

  const QUESTION_CONTENT = {
    // Строка №1
    "50.1": {
      question: "Впишите вопрос №1 на 50 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "100.1": {
      question: "Впишите вопрос №1 на 100 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "150.1": {
      question: "Впишите вопрос №1 на 150 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "200.1": {
      question: "Впишите вопрос №1 на 200 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "250.1": {
      question: "Впишите вопрос №1 на 250 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },

    // Строка №2
    "50.2": {
      question: "Впишите вопрос №2 на 50 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "100.2": {
      question: "Впишите вопрос №2 на 100 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "150.2": {
      question: "Впишите вопрос №2 на 150 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "200.2": {
      question: "Впишите вопрос №2 на 200 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "250.2": {
      question: "Впишите вопрос №2 на 250 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },

    // Строка №3
    "50.3": {
      question: "Впишите вопрос №3 на 50 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "100.3": {
      question: "Впишите вопрос №3 на 100 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "150.3": {
      question: "Впишите вопрос №3 на 150 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "200.3": {
      question: "Впишите вопрос №3 на 200 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "250.3": {
      question: "Впишите вопрос №3 на 250 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },

    // Строка №4
    "50.4": {
      question: "Впишите вопрос №4 на 50 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "100.4": {
      question: "Впишите вопрос №4 на 100 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "150.4": {
      question: "Впишите вопрос №4 на 150 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "200.4": {
      question: "Впишите вопрос №4 на 200 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "250.4": {
      question: "Впишите вопрос №4 на 250 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },

    // Строка №7
    "50.7": {
      question: "Впишите вопрос №7 на 50 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "100.7": {
      question: "Впишите вопрос №7 на 100 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "150.7": {
      question: "Впишите вопрос №7 на 150 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "200.7": {
      question: "Впишите вопрос №7 на 200 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "250.7": {
      question: "Впишите вопрос №7 на 250 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },

    // Строка №9
    "50.9": {
      question: "Впишите вопрос №9 на 50 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "100.9": {
      question: "Впишите вопрос №9 на 100 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "150.9": {
      question: "Впишите вопрос №9 на 150 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "200.9": {
      question: "Впишите вопрос №9 на 200 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    },
    "250.9": {
      question: "Впишите вопрос №9 на 250 очков.",
      answers: ["ВПИШИТЕ ОТВЕТ"]
    }
  };

  const $ = id => document.getElementById(id);

  const questions = [];
  const cells = new Map();
  const usedQuestions = new Set();

  let score = 0;
  let currentQuestion = null;
  let finished = false;
  let finishing = false;

  // После подтверждения завершения счёт фиксируется.
  // При ошибке сети можно повторить получение того же кода.
  let sealed = false;
  let resultRequestId = null;
  let issuedCode = null;

  for (const row of ROW_NUMBERS) {
    for (const value of VALUES) {
      const id = value + "." + row;

      const content = QUESTION_CONTENT[id] || {
        question: "Этот вопрос пока не заполнен.",
        answers: []
      };

      questions.push({
        id,
        row,
        value,
        image: "./" + id + ".png",
        question: content.question,
        answers: content.answers
      });
    }
  }

  function normalizeAnswer(value) {
    return String(value ?? "")
      .normalize("NFKC")
      .toLocaleLowerCase("ru-RU")
      .replace(/ё/g, "е")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getAnswers(question) {
    if (!Array.isArray(question.answers)) {
      return [];
    }

    return question.answers
      .map(value => String(value).trim())
      .filter(Boolean);
  }

  function isConfigured(question) {
    const answers = getAnswers(question);

    return (
      answers.length > 0 &&
      !answers.some(answer =>
        normalizeAnswer(answer).includes("впишите ответ")
      )
    );
  }

  function updateScore() {
    $("score").textContent = String(score);
  }

  function animateScoreChange(delta) {
    const element = document.createElement("span");

    element.className =
      "score-change " +
      (delta > 0 ? "is-positive" : "is-negative");

    element.textContent =
      delta > 0
        ? "+" + delta
        : "−" + Math.abs(delta);

    element.setAttribute("aria-hidden", "true");

    $("scoreWrap").append(element);

    window.setTimeout(() => {
      element.remove();
    }, 1200);
  }

  function renderBoard() {
    $("rowLabels").replaceChildren();
    $("board").replaceChildren();

    cells.clear();

    ROW_NUMBERS.forEach(row => {
      const label = document.createElement("div");

      label.className = "row-label";
      label.textContent = "№" + row;

      $("rowLabels").append(label);
    });

    questions.forEach(question => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "cell";

      button.setAttribute(
        "aria-label",
        "№" + question.row +
        ", вопрос на " +
        question.value +
        " очков"
      );

      button.setAttribute("aria-pressed", "false");

      const image = document.createElement("img");
      image.alt = "";
      image.draggable = false;

      const fallback = document.createElement("span");

      fallback.className = "cell-fallback";
      fallback.textContent = String(question.value);
      fallback.hidden = true;

      image.addEventListener("error", () => {
        image.hidden = true;
        fallback.hidden = false;
      });

      image.src = question.image;

      button.append(image, fallback);

      button.addEventListener("click", () => {
        openQuestion(question);
      });

      cells.set(question.id, button);
      $("board").append(button);
    });
  }

  function setSelectedCell(id) {
    for (const [cellId, button] of cells) {
      const selected = cellId === id;

      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    }
  }

  function openQuestion(question) {
    if (
      finished ||
      finishing ||
      sealed ||
      usedQuestions.has(question.id)
    ) {
      return;
    }

    currentQuestion = question;

    setSelectedCell(question.id);

    $("questionText").hidden = false;
    $("questionText").classList.remove("is-placeholder");
    $("questionText").textContent = question.question;

    $("finishResult").hidden = true;

    const input = $("answerInput");

    input.value = "";
    input.placeholder = "Ответ";
    input.disabled = false;
    input.readOnly = false;

    input.classList.remove("is-correct", "is-wrong");
    input.setAttribute("aria-label", "Введите ответ");

    $("liveMessage").textContent = "";

    $("answerHint").textContent =
      "Введите ответ и нажмите Enter.";

    if (!isConfigured(question)) {
      input.disabled = true;
      input.placeholder = "Вопрос ещё не настроен";

      $("liveMessage").textContent =
        "Добавьте правильный ответ в QUESTION_CONTENT " +
        "для ячейки " + question.id + ".";

      return;
    }

    input.focus();
  }

  function submitAnswer(event) {
    event.preventDefault();

    if (
      finished ||
      finishing ||
      sealed ||
      !currentQuestion ||
      usedQuestions.has(currentQuestion.id)
    ) {
      return;
    }

    const question = currentQuestion;
    const input = $("answerInput");

    if (!isConfigured(question)) {
      return;
    }

    const userAnswer = normalizeAnswer(input.value);

    if (!userAnswer) {
      $("liveMessage").textContent =
        "Сначала введите ответ.";

      input.focus();
      return;
    }

    const answers = getAnswers(question);

    const correct = answers.some(answer =>
      normalizeAnswer(answer) === userAnswer
    );

    usedQuestions.add(question.id);
    currentQuestion = null;

    const delta = correct
      ? question.value
      : -question.value;

    score += delta;

    updateScore();
    animateScoreChange(delta);

    const cell = cells.get(question.id);

    if (cell) {
      cell.disabled = true;

      cell.classList.add(
        "is-used",
        correct ? "is-correct" : "is-wrong"
      );
    }

    input.readOnly = true;

    input.classList.add(
      correct ? "is-correct" : "is-wrong"
    );

    input.value = correct
      ? "Верно!"
      : "Неверно. Правильный ответ: " + answers[0];

    input.setAttribute("aria-label", input.value);
    input.setSelectionRange(0, 0);
    input.scrollLeft = 0;

    $("liveMessage").textContent = correct
      ? "Начислено " + question.value + " очков."
      : "Списано " + question.value + " очков.";

    $("answerHint").textContent =
      usedQuestions.size === questions.length
        ? "Все вопросы пройдены. Нажмите «Завершить»."
        : "Выберите следующую ячейку.";

    const nextQuestion = questions.find(item =>
      !usedQuestions.has(item.id)
    );

    if (nextQuestion) {
      cells.get(nextQuestion.id)?.focus({
        preventScroll: true
      });
    } else {
      $("finishButton").focus({
        preventScroll: true
      });
    }
  }

  function createRequestId() {
    if (window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);

    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;

    const hex = Array.from(
      bytes,
      byte => byte.toString(16).padStart(2, "0")
    ).join("");

    return (
      hex.slice(0, 8) + "-" +
      hex.slice(8, 12) + "-" +
      hex.slice(12, 16) + "-" +
      hex.slice(16, 20) + "-" +
      hex.slice(20)
    );
  }

  async function requestRewardCode() {
    if (!resultRequestId) {
      resultRequestId = createRequestId();
    }

    const controller = new AbortController();

    const timeout = window.setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const response = await fetch(REWARD_API_URL, {
        method: "POST",

        headers: {
          "apikey": REWARD_PUBLIC_KEY,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          p_points: score,
          p_request_id: resultRequestId
        }),

        signal: controller.signal
      });

      const responseText = await response.text();

      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Сервер вернул неожиданный ответ."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Не удалось зарегистрировать результат."
        );
      }

      if (!result?.code) {
        throw new Error(
          "Сервер не вернул код результата."
        );
      }

      return result.code;

    } finally {
      window.clearTimeout(timeout);
    }
  }

  function showFinishedResult(code) {
    finished = true;
    currentQuestion = null;
    issuedCode = code;

    setSelectedCell(null);

    $("questionText").hidden = true;
    $("finishResult").hidden = false;

    $("finalScore").textContent =
      "Ваш итоговый счёт: " + score;

    $("resultCode").hidden = !code;
    $("copyCode").hidden = !code;
    $("resultCode").textContent = code || "";

    if (code) {
      $("codeDescription").textContent =
        "Введите этот код в панели стикеров " +
        "«Mario Party». К вашему общему счёту " +
        "прибавится " + score + " очков.";

      $("codeWarning").textContent =
        "Код можно использовать только один раз. " +
        "Сохраните его перед закрытием страницы.";

      $("answerHint").textContent =
        "Сохраните код результата.";

      $("liveMessage").textContent =
        "Результат сохранён. Код готов.";

    } else {
      $("codeDescription").textContent =
        "Для получения кода нужно закончить " +
        "игру с положительным счётом.";

      $("codeWarning").textContent =
        "Очки в Mario Party не начислены " +
        "и не списаны.";

      $("answerHint").textContent =
        "Игра завершена.";

      $("liveMessage").textContent =
        "Игра завершена без выдачи кода.";
    }

    const input = $("answerInput");

    input.value = "";
    input.placeholder = "Игра завершена";
    input.disabled = true;
    input.readOnly = true;

    input.classList.remove("is-correct", "is-wrong");
    input.setAttribute("aria-label", "Игра завершена");

    $("finishButton").textContent = "Завершено";
    $("finishButton").disabled = true;
  }

  async function finishGame() {
    if (finished || finishing) {
      return;
    }

    if (!sealed) {
      const approved = window.confirm(
        "Завершить игру? После этого отвечать " +
        "на вопросы будет нельзя."
      );

      if (!approved) {
        return;
      }

      sealed = true;
    }

    finishing = true;

    $("finishButton").disabled = true;
    $("finishButton").textContent = "Сохраняем…";

    $("answerInput").disabled = true;

    for (const cell of cells.values()) {
      cell.disabled = true;
    }

    $("liveMessage").textContent = score > 0
      ? "Сохраняем результат и получаем код…"
      : "Завершаем игру…";

    try {
      const code = score > 0
        ? await requestRewardCode()
        : null;

      showFinishedResult(code);

    } catch (error) {
      console.error(error);

      const message = error.name === "AbortError"
        ? "Сервер не ответил вовремя."
        : error.message || "Ошибка сохранения.";

      $("liveMessage").textContent =
        message +
        " Нажмите «Повторить» для получения кода. " +
        "Не обновляйте страницу.";

      $("answerHint").textContent =
        "Счёт зафиксирован: " + score +
        ". Дождитесь получения кода.";

      $("finishButton").disabled = false;
      $("finishButton").textContent = "Повторить";

    } finally {
      finishing = false;
    }
  }

  async function copyCode() {
    if (!issuedCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(issuedCode);

      $("copyCode").textContent = "Скопировано";

      window.setTimeout(() => {
        $("copyCode").textContent = "Скопировать код";
      }, 1800);

    } catch {
      const selection = window.getSelection();
      const range = document.createRange();

      range.selectNodeContents($("resultCode"));
      selection.removeAllRanges();
      selection.addRange(range);

      $("liveMessage").textContent =
        "Код выделен. Скопируйте его вручную.";
    }
  }

  $("answerForm").addEventListener(
    "submit",
    submitAnswer
  );

  $("finishButton").addEventListener(
    "click",
    finishGame
  );

  $("copyCode").addEventListener(
    "click",
    copyCode
  );

  // Предупреждение о потере незавершённой партии.
  window.addEventListener("beforeunload", event => {
    if (!finished && (usedQuestions.size > 0 || sealed)) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  renderBoard();
  updateScore();
})();