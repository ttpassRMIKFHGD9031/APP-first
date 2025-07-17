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
