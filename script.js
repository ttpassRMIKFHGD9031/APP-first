// マイアーティストの追加・表示
function addArtist() {
  const input = document.getElementById("artistInput");
  const name = input.value.trim();
  if (!name) return alert("アーティスト名を入力してください");

  let artists = JSON.parse(localStorage.getItem("myArtists") || "[]");
  artists.push(name);
  localStorage.setItem("myArtists", JSON.stringify(artists));
  input.value = "";
  displayArtists();
}

function displayArtists() {
  const list = document.getElementById("artistList");
  if (!list) return;
  const artists = JSON.parse(localStorage.getItem("myArtists") || "[]");
  list.innerHTML = "";
  artists.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    list.appendChild(li);
  });
}

// カレンダーイベント追加と表示
function addEvent() {
  const title = document.getElementById("eventTitle").value.trim();
  const date = document.getElementById("eventDate").value;

  if (!title || !date) {
    alert("イベント名と日付を入力してください");
    return;
  }

  let events = JSON.parse(localStorage.getItem("myEvents") || "[]");
  events.push({ title, date });
  localStorage.setItem("myEvents", JSON.stringify(events));
  location.reload();
}

function renderCalendar() {
  const events = JSON.parse(localStorage.getItem("myEvents") || "[]");

  const calendarEl = document.getElementById("calendar");
  if (!calendarEl) return;

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    events: events.map(e => ({ title: e.title, start: e.date })),
    locale: "ja"
  });

  calendar.render();
}

// ページごとの初期化
window.addEventListener("DOMContentLoaded", () => {
  displayArtists();
  renderCalendar();
});
