(() => {
  "use strict";

  const VALUES = [50, 100, 150, 200, 250];
  const ROW_NUMBERS = [1, 2, 3, 4, 7, 9];

  const REWARD_API_URL =
    "https://juchryyubxkuapnaqelj.supabase.co/rest/v1/rpc/mp_issue_ballomania_code";

  const REWARD_PUBLIC_KEY =
    "sb_publishable_l75mr1kAzXwX6aPUEvruEA_GfmLKIE-";

  const CONTENT = window.BALLOMANIA_CONTENT || {};

  const $ = id => document.getElementById(id);

  const questions = [];
  const cells = new Map();
  const used = new Set();

  let score = 0;
  let current = null;
  let imageReady = false;

  let sealed = false;
  let finishing = false;
  let finished = false;

  let requestId = null;
  let issuedCode = null;
  let imageVersion = 0;

  for (const row of ROW_NUMBERS) {
    for (const value of VALUES) {
      const id = value + "." + row;
      const item = CONTENT[id];

      // Поддерживаются и answers: [...], и прежнее answer: "...".
      let rawAnswers = [];

      if (Array.isArray(item)) {
        rawAnswers = item;
      } else if (typeof item === "string") {
        rawAnswers = [item];
      } else if (Array.isArray(item?.answers)) {
        rawAnswers = item.answers;
      } else if (item?.answer !== undefined) {
        rawAnswers = [item.answer];
      }

      const answers = rawAnswers
        .map(answer =>
          String(answer).replace(/✅/g, "").trim()
        )
        .filter(Boolean);

      questions.push({
        id,
        row,
        value,
        image: "./" + id + ".png",
        answers
      });
    }
  }

  function normalize(value) {
    return String(value ?? "")
      .normalize("NFKC")
      .toLocaleLowerCase("ru-RU")
      .replace(/ё/g, "е")
      .replace(/\s+/g, " ")
      .trim();
  }

  function configured(question) {
    return (
      question.answers.length > 0 &&
      !question.answers.some(answer =>
        normalize(answer).includes("впишите ответ")
      )
    );
  }

  function updateScore() {
    $("score").textContent = String(score);
  }

  function animateScore(delta) {
    const element = document.createElement("span");

    element.className =
      "score-change " +
      (delta > 0 ? "positive" : "negative");

    element.textContent = delta > 0
      ? "+" + delta
      : "−" + Math.abs(delta);

    element.setAttribute("aria-hidden", "true");

    $("scoreWrap").append(element);

    setTimeout(() => element.remove(), 1200);
  }

  function selectCell(id) {
    for (const [cellId, button] of cells) {
      const selected = cellId === id;

      button.classList.toggle("selected", selected);
      button.setAttribute(
        "aria-pressed",
        String(selected)
      );
    }
  }

  function renderBoard() {
    $("rowLabels").replaceChildren();
    $("board").replaceChildren();

    for (const row of ROW_NUMBERS) {
      const label = document.createElement("div");

      label.className = "row-label";
      label.textContent = "№" + row;

      $("rowLabels").append(label);
    }

    for (const question of questions) {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "cell";

      // В таблице только число, не картинка.
      button.textContent = String(question.value);

      button.setAttribute(
        "aria-label",
        "№" + question.row +
        ", " + question.value + " очков"
      );

      button.setAttribute("aria-pressed", "false");

      button.addEventListener("click", () => {
        openQuestion(question);
      });

      cells.set(question.id, button);
      $("board").append(button);
    }
  }

  function openQuestion(question) {
    if (
      sealed ||
      finishing ||
      finished ||
      used.has(question.id)
    ) {
      return;
    }

    current = question;
    imageReady = false;

    const version = ++imageVersion;

    selectCell(question.id);

    $("finishResult").hidden = true;

    const placeholder = $("questionPlaceholder");

    placeholder.hidden = false;
    placeholder.textContent = "Загружаем вопрос…";

    const image = $("questionImage");

    image.hidden = true;

    const input = $("answerInput");

    input.value = "";
    input.placeholder = "Ответ";
    input.readOnly = false;
    input.disabled = true;

    input.classList.remove("correct", "wrong");
    input.setAttribute("aria-label", "Введите ответ");

    $("liveMessage").textContent = "";

    $("answerHint").textContent =
      "Введите ответ и нажмите Enter.";

    // Загружаем отдельно, чтобы быстрые переключения
    // ячеек не показывали предыдущую картинку.
    const loader = new Image();

    loader.onload = () => {
      if (
        version !== imageVersion ||
        sealed ||
        finished
      ) {
        return;
      }

      image.src = question.image;

      image.alt =
        "Вопрос №" + question.row +
        " на " + question.value + " очков";

      image.hidden = false;
      placeholder.hidden = true;
      imageReady = true;

      if (!configured(question)) {
        input.placeholder = "Ответ ещё не настроен";

        $("liveMessage").textContent =
          "Добавьте правильный ответ для " +
          question.id + " в index.html.";

        return;
      }

      input.disabled = false;
      input.focus();
    };

    loader.onerror = () => {
      if (
        version !== imageVersion ||
        sealed ||
        finished
      ) {
        return;
      }

      imageReady = false;
      image.hidden = true;

      placeholder.hidden = false;
      placeholder.textContent =
        "Не найдена картинка " +
        question.id +
        ".png. Проверьте имя файла в репозитории.";

      input.disabled = true;

      $("liveMessage").textContent =
        "Без картинки ответ недоступен. Очки не списаны.";
    };

    loader.src = question.image;
  }

  function submitAnswer(event) {
    event.preventDefault();

    if (
      sealed ||
      finishing ||
      finished ||
      !current ||
      !imageReady ||
      used.has(current.id) ||
      !configured(current)
    ) {
      return;
    }

    const input = $("answerInput");
    const answer = normalize(input.value);

    if (!answer) {
      $("liveMessage").textContent =
        "Сначала введите ответ.";

      input.focus();
      return;
    }

    const question = current;

    const correct = question.answers.some(
      option => normalize(option) === answer
    );

    used.add(question.id);
    current = null;

    const delta = correct
      ? question.value
      : -question.value;

    score += delta;

    updateScore();
    animateScore(delta);

    const cell = cells.get(question.id);

    cell.disabled = true;
    cell.classList.add(
      "used",
      correct ? "correct" : "wrong"
    );

    input.readOnly = true;

    input.classList.add(
      correct ? "correct" : "wrong"
    );

    input.value = correct
      ? "Верно!"
      : "Неверно. Правильный ответ: " +
        question.answers[0];

    input.setAttribute("aria-label", input.value);
    input.setSelectionRange(0, 0);
    input.scrollLeft = 0;

    $("liveMessage").textContent = correct
      ? "Начислено " + question.value + " очков."
      : "Списано " + question.value + " очков.";

    $("answerHint").textContent =
      used.size === questions.length
        ? "Все вопросы пройдены. Нажмите «Завершить»."
        : "Выберите следующую ячейку.";

    const next = questions.find(
      item => !used.has(item.id)
    );

    if (next) {
      cells.get(next.id).focus({
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

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20)
    ].join("-");
  }

  async function requestCode() {
    if (!requestId) {
      requestId = createRequestId();
    }

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      15000
    );

    try {
      const response = await fetch(REWARD_API_URL, {
        method: "POST",

        headers: {
          "apikey": REWARD_PUBLIC_KEY,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          p_points: score,
          p_request_id: requestId
        }),

        signal: controller.signal
      });

      const text = await response.text();

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          "Сервер вернул неожиданный ответ."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Не удалось сохранить результат."
        );
      }

      if (!result?.code) {
        throw new Error(
          "Сервер не вернул код результата."
        );
      }

      return result.code;

    } finally {
      clearTimeout(timeout);
    }
  }

  function showResult(code) {
    finished = true;
    issuedCode = code;
    current = null;

    selectCell(null);

    $("questionImage").hidden = true;
    $("questionPlaceholder").hidden = true;
    $("finishResult").hidden = false;

    $("finalScore").textContent =
      "Ваш итоговый счёт: " + score;

    $("resultCode").textContent = code || "";
    $("resultCode").hidden = !code;
    $("copyCode").hidden = !code;

    if (code) {
      $("codeDescription").textContent =
        "Введите этот код в панели стикеров " +
        "«Mario Party» для покупки стикеров. " +
        "К общему счёту прибавится " +
        score + " очков.";

      $("codeWarning").textContent =
        "Код можно использовать только один раз. " +
        "Сохраните его перед закрытием страницы.";

      $("liveMessage").textContent =
        "Результат сохранён. Код готов.";

    } else {
      $("codeDescription").textContent =
        "Для получения кода нужен положительный счёт.";

      $("codeWarning").textContent =
        "Счёт Mario Party не изменился.";

      $("liveMessage").textContent =
        "Игра завершена без выдачи кода.";
    }

    const input = $("answerInput");

    input.value = "";
    input.placeholder = "Игра завершена";
    input.disabled = true;
    input.readOnly = true;

    input.classList.remove("correct", "wrong");
    input.setAttribute("aria-label", "Игра завершена");

    $("answerHint").textContent = code
      ? "Сохраните код результата."
      : "Игра завершена.";

    $("finishButton").textContent = "Завершено";
    $("finishButton").disabled = true;
  }

  async function finishGame() {
    if (finished || finishing) {
      return;
    }

    if (!sealed) {
      const confirmed = window.confirm(
        "Завершить игру? После этого " +
        "отвечать на вопросы будет нельзя."
      );

      if (!confirmed) return;

      sealed = true;

      // Отменяем обработку ещё загружаемой картинки.
      imageVersion++;
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
        ? await requestCode()
        : null;

      showResult(code);

    } catch (error) {
      console.error(error);

      const message = error.name === "AbortError"
        ? "Сервер не ответил вовремя."
        : error.message || "Ошибка сохранения.";

      $("liveMessage").textContent =
        message +
        " Нажмите «Повторить». " +
        "Не обновляйте страницу.";

      $("answerHint").textContent =
        "Счёт зафиксирован: " + score + ".";

      $("finishButton").disabled = false;
      $("finishButton").textContent = "Повторить";

    } finally {
      finishing = false;
    }
  }

  async function copyCode() {
    if (!issuedCode) return;

    try {
      await navigator.clipboard.writeText(issuedCode);

      $("copyCode").textContent = "Скопировано";

      setTimeout(() => {
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

  window.addEventListener("beforeunload", event => {
    if (!finished && (used.size > 0 || sealed)) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  renderBoard();
  updateScore();
})();
