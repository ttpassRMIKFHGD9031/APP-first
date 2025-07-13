// script.js

// === グローバルデータ ===
let myArtists = [];
let notifications = [];

// === 要素取得 ===
const btnShowSearch = document.getElementById('btn-show-search');
const btnShowCalendar = document.getElementById('btn-show-calendar');
const btnShowMyArtists = document.getElementById('btn-show-myartists');
const btnShowNotifications = document.getElementById('btn-show-notifications');

const sections = {
  search: document.getElementById('section-search'),
  calendar: document.getElementById('section-calendar'),
  myartists: document.getElementById('section-myartists'),
  notifications: document.getElementById('section-notifications'),
};

const artistSearchInput = document.getElementById('artist-search-input');
const artistSuggestions = document.getElementById('artist-suggestions');
const artistInfo = document.getElementById('artist-info');

const myArtistList = document.getElementById('my-artist-list');
const notificationList = document.getElementById('notification-list');

// === ページ切替関数 ===
function switchSection(sectionKey) {
  Object.keys(sections).forEach(key => {
    if (key === sectionKey) {
      sections[key].classList.add('active');
    } else {
      sections[key].classList.remove('active');
    }
  });

  // ボタンのactive切り替え
  [btnShowSearch, btnShowCalendar, btnShowMyArtists, btnShowNotifications].forEach(btn => {
    btn.classList.remove('active');
  });
  if (sectionKey === 'search') btnShowSearch.classList.add('active');
  if (sectionKey === 'calendar') btnShowCalendar.classList.add('active');
  if (sectionKey === 'myartists') btnShowMyArtists.classList.add('active');
  if (sectionKey === 'notifications') btnShowNotifications.classList.add('active');
}

// === イベント登録（簡易的にローカル保存） ===
function addNotification(text) {
  const now = new Date();
  notifications.push({ id: Date.now(), text, date: now.toLocaleString() });
  renderNotifications();
  // ブラウザ通知
  if (Notification.permission === "granted") {
    new Notification("推し活通知", { body: text });
  }
}

// === 表示レンダリング ===
function renderMyArtists() {
  myArtistList.innerHTML = '';
  if (myArtists.length === 0) {
    myArtistList.innerHTML = '<li>まだ登録されたアーティストはいません。</li>';
    return;
  }
  myArtists.forEach(artist => {
    const li = document.createElement('li');
    li.textContent = artist.name;
    myArtistList.appendChild(li);
  });
}

function renderNotifications() {
  notificationList.innerHTML = '';
  if (notifications.length === 0) {
    notificationList.innerHTML = '<li>通知はありません。</li>';
    return;
  }
  notifications.forEach(n => {
    const li = document.createElement('li');
    li.textContent = `[${n.date}] ${n.text}`;
    notificationList.appendChild(li);
  });
}

// === フルカレンダー初期化 ===
let calendar = null;
function renderCalendar() {
  if (!calendar) {
    calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
      initialView: 'dayGridMonth',
      themeSystem: 'standard',
      events: myArtists.map(artist => ({
        title: artist.name + ' ライブ',
        start: artist.nextLiveDate || new Date(),
        allDay: true,
      })),
      height: 'auto',
    });
    calendar.render();
  } else {
    calendar.refetchEvents();
  }
}

// === アーティスト検索 ===
// ここではサンプルとして固定アーティスト配列で検索（本来はAPIなどから取得）
const sampleArtists = [
  { name: '米津玄師', genre: 'J-Pop', description: '日本のシンガーソングライター。', officialWebsite: 'https://www.yonezukenshi.jp/' },
  { name: '星野源', genre: 'J-Pop', description: 'シンガーソングライター、俳優。', officialWebsite: 'https://www.hoshinogen.com/' },
  { name: 'YOASOBI', genre: 'J-Pop', description: '音楽ユニット。', officialWebsite: 'https://www.yoasobi-music.jp/' },
];

function filterArtists(query) {
  return sampleArtists.filter(artist => artist.name.includes(query));
}

function showSuggestions(query) {
  if (!query) {
    artistSuggestions.innerHTML = '';
    return;
  }
  const results = filterArtists(query);
  artistSuggestions.innerHTML = '';
  results.forEach(artist => {
    const div = document.createElement('div');
    div.textContent = artist.name;
    div.onclick = () => showArtistInfo(artist);
    artistSuggestions.appendChild(div);
  });
}

function showArtistInfo(artist) {
  artistInfo.innerHTML = `
    <h3>${artist.name}</h3>
    <p><strong>ジャンル:</strong> ${artist.genre}</p>
    <p>${artist.description}</p>
    <p><a href="${artist.officialWebsite}" target="_blank" rel="noopener">公式サイトへ</a></p>
    <button id="btn-add-artist">マイアーティストに追加</button>
  `;
  document.getElementById('btn-add-artist').onclick = () => {
    if (myArtists.find(a => a.name === artist.name)) {
      alert('すでにマイアーティストに登録されています');
      return;
    }
    myArtists.push(artist);
    addNotification(`${artist.name} をマイアーティストに追加しました！`);
    renderMyArtists();
    artistInfo.innerHTML = '';
    artistSuggestions.innerHTML = '';
    artistSearchInput.value = '';
  };
}

// === イベントリスナー ===
artistSearchInput.addEventListener('input', e => {
  showSuggestions(e.target.value);
});

btnShowSearch.addEventListener('click', () => switchSection('search'));
btnShowCalendar.addEventListener('click', () => {
  switchSection('calendar');
  renderCalendar();
});
btnShowMyArtists.addEventListener('click', () => {
  switchSection('myartists');
  renderMyArtists();
});
btnShowNotifications.addEventListener('click', () => {
  switchSection('notifications');
  renderNotifications();
});

// === 通知許可要求 ===
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// 最初は検索画面を表示
switchSection('search');
