function renderCalendar(events) {
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'ja',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    events: events.map(event => ({
      title: event.title,
      start: event.date,
      description: event.description || '',
    })),
    eventClick: function(info) {
      alert(`${info.event.title}\n${info.event.startStr}`);
    }
  });
  calendar.render();
}
