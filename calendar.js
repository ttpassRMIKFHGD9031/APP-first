let currentDate = new Date();
let events = {};

const monthYear = document.getElementById("monthYear");
const calendarBody = document.getElementById("calendarBody");
const prevMonth = document.getElementById("prevMonth");
const nextMonth = document.getElementById("nextMonth");

const eventInput = document.getElementById("eventInput");
const selectedDateText = document.getElementById("selectedDate");
const eventText = document.getElementById("eventText");
const saveEvent = document.getElementById("saveEvent");

let selectedCell = null;

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  monthYear.textContent = `${year}年 ${month + 1}月`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  calendarBody.innerHTML = "";
  let row = document.createElement("tr");
  
  for (let i = 0; i < firstDay; i++) {
    row.appendChild(document.createElement("td"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    if ((row.children.length) % 7 === 0 && day !== 1) {
      calendarBody.appendChild(row);
      row = document.createElement("tr");
    }

    const cell = document.createElement("td");
    cell.textContent = day;
    const key = `${year}-${month + 1}-${day}`;
    
    if (events[key]) {
      const e = document.createElement("div");
      e.className = "event";
      e.textContent = events[key];
      cell.appendChild(e);
    }

    cell.addEventListener("click", () => {
      selectedDateText.textContent = `${month + 1}月${day}日の予定：`;
      eventText.value = events[key] || "";
      eventInput.classList.remove("hidden");
      selectedCell = key;
    });

    row.appendChild(cell);
  }

  calendarBody.appendChild(row);
}

saveEvent.addEventListener("click", () => {
  const text = eventText.value.trim();
  if (text && selectedCell) {
    events[selectedCell] = text;
  } else {
    delete events[selectedCell];
  }
  eventInput.classList.add("hidden");
  renderCalendar();
});

prevMonth.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextMonth.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();
