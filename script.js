let calendar;

document.addEventListener('DOMContentLoaded', () => {
  const calendarEl = document.getElementById('calendar');

  if (calendarEl) {
    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 500,
      locale: 'ja',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listMonth'
      },
      events: [] // 後でイベント追加も可
    });

    calendar.render();
  }
});

function toggleCalendar() {
  const container = document.getElementById('calendar-container');
  container.style.display = 'block';
  if (calendar) {
    calendar.render(); // 必ず再描画
  }
}

function hideCalendar() {
  const container = document.getElementById('calendar-container');
  container.style.display = 'none';
}
