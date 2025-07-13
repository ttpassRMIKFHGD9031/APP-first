function addArtist() {
  const input = document.getElementById("artistInput");
  const name = input.value.trim();
  if (!name) return alert("アーティスト名を入力してください");

  let artists = JSON.parse(localStorage.getItem("myArtists") || "[]");
  artists.push(name);
  localStorage.setItem("myArtists", JSON.stringify(artists));
  input.value = "";
  displayArtists();
  notify("アーティストを追加しました！");
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

function searchArtist() {
  const input = document.getElementById("artistInput");
  const name = input.value.trim();
  if (!name) return alert("検索するアーティスト名を入力してください");

  const mockData = {
    "アメフラッシ": {
      genre: "J-Pop",
      bio: "スターダストプロモーション所属の女性アイドルグループ。ライブとYouTubeのギャップが魅力。",
      url: "https://www.amefurashi.jp/"
    },
    "YOASOBI": {
      genre: "J-Pop",
      bio: "小説を音楽にするユニット。Ayaseとikuraからなる。",
      url: "https://www.yoasobi-music.jp/"
    }
  };

  const artist = mockData[name];
  const section = document.getElementById("artistInfoSection");
  const div = document.getElementById("artistInfo");

  if (artist) {
    div.innerHTML = `
      <p><strong>ジャンル:</strong> ${artist.genre}</p>
      <p><strong>紹介:</strong> ${artist.bio}</p>
      <p><a href="${artist.url}" target="_blank">公式サイト</a></p>
    `;
    section.style.display = "block";
  } else {
    div.innerHTML = "<p>該当アーティストが見つかりませんでした。</p>";
    section.style.display = "block";
  }
}

function addEvent() {
  const title = document.getElementById("eventTitle").value.trim();
  const date = document.getElementById("eventDate").value;
  if (!title || !date) return alert("イベント名と日付を入力してください");

  let events = JSON.parse(localStorage.getItem("myEvents") || "[]");
  events.push({ title, date });
  localStorage.setItem("myEvents", JSON.stringify(events));
  notify("イベントを登録しました！");
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

function notify(message) {
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(message);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") new Notification(message);
      });
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  displayArtists();
  renderCalendar();
});
