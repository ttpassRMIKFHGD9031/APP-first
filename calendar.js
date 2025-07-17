// カレンダー表示処理
let currentDate = new Date();

function renderCalendar() {
  const calendarBody = document.getElementById("calendarBody");
  const monthYear = document.getElementById("monthYear");
  calendarBody.innerHTML = ""; // 既存のカレンダーをクリア

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  monthYear.textContent = `${year}年${month + 1}月`;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  let date = 1;
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {
      const cell = document.createElement("td");

      if (i === 0 && j < firstDay) {
        cell.textContent = "";
      } else if (date > lastDate) {
        break;
      } else {
        cell.textContent = date;
        cell.classList.add("calendar-day");
        cell.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;

        // イベント追加のためのクリックリスナー
        cell.addEventListener("click", () => {
          document.getElementById("eventInput").classList.remove("hidden");
          document.getElementById("selectedDate").textContent = cell.dataset.date;
        });

        date++;
      }
      row.appendChild(cell);
    }
    calendarBody.appendChild(row);
  }
}

// 前後月ボタン
document.getElementById("prevMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// 初期表示
document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
});

document.addEventListener('DOMContentLoaded', function () {
  const sections = document.querySelectorAll('.section');
  const buttons = document.querySelectorAll('.nav-btn');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.id.replace('btn-show-', 'section-');

      sections.forEach((sec) => {
        sec.classList.remove('active');
      });
      document.getElementById(targetId).classList.add('active');

      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      if (targetId === 'section-calendar') {
        renderCalendar(currentYear, currentMonth);
      }
    });
  });

  // ==== カレンダー処理 ====
  const calendarBody = document.getElementById("calendarBody");
  const monthYear = document.getElementById("monthYear");
  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  let currentMonth = currentDate.getMonth();

  function renderCalendar(year, month) {
    calendarBody.innerHTML = ""; // 初期化
    const firstDay = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0).getDate();
    const startDay = firstDay.getDay();
    let date = 1;

    monthYear.textContent = `${year}年${month + 1}月`;

    for (let i = 0; i < 6; i++) {
      const row = document.createElement("tr");

      for (let j = 0; j < 7; j++) {
        const cell = document.createElement("td");

        if (i === 0 && j < startDay) {
          cell.textContent = "";
        } else if (date > lastDate) {
          break;
        } else {
          cell.textContent = date;
          cell.addEventListener("click", () => selectDate(year, month, date));
          date++;
        }

        row.appendChild(cell);
      }

      calendarBody.appendChild(row);
    }
  }

  function selectDate(year, month, day) {
    const eventInput = document.getElementById("eventInput");
    const selectedDate = document.getElementById("selectedDate");
    const eventText = document.getElementById("eventText");

    selectedDate.textContent = `${year}年${month + 1}月${day}日`;
    eventText.value = "";
    eventInput.classList.remove("hidden");

    document.getElementById("saveEvent").onclick = function () {
      const text = eventText.value.trim();
      if (text) {
        alert(`${selectedDate.textContent} に「${text}」を追加しました！`);
      }
      eventInput.classList.add("hidden");
    };
  }

  document.getElementById("prevMonth").addEventListener("click", () => {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
    renderCalendar(currentYear, currentMonth);
  });

  document.getElementById("nextMonth").addEventListener("click", () => {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
    renderCalendar(currentYear, currentMonth);
  });

  // 初期状態では描画しない（表示されたときに描画）
});
