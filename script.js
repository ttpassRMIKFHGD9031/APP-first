// DOM要素取得
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

const artistSearchInput = document.getElementById('artist-search-input');
const artistSuggestionsDiv = document.getElementById('artist-suggestions');
const artistInfoDiv = document.getElementById('artist-info');
const addArtistBtn = document.getElementById('add-artist-btn');

const myArtistListUl = document.getElementById('my-artist-list');

const notificationListUl = document.getElementById('notification-list');

// カレンダー関連
const calendarBody = document.getElementById('calendarBody');
const monthYearSpan = document.getElementById('monthYear');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const eventInputDiv = document.getElementById('eventInput');
const selectedDateP = document.getElementById('selectedDate');
const eventTextInput = document.getElementById('eventText');
const saveEventBtn = document.getElementById('saveEvent');

let currentView = 'search'; // 現在表示中のセクションID
let selectedArtist = null; // 現在選択中のアーティストオブジェクト
let myArtists = [];
let notifications = [];
let events = {}; // { 'YYYY-MM-DD': ['イベント1', 'イベント2'] }

let today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();

// --- ユーティリティ ---
function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

// --- 画面切替 ---
function switchView(viewId) {
  currentView = viewId;
  sections.forEach(section => {
    if (section.id === `section-${viewId}`) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });
  navButtons.forEach(btn => {
    if (btn.id === `btn-show-${viewId}`) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if(viewId === 'myartists') {
    renderMyArtists();
  } else if(viewId === 'notifications') {
    renderNotifications();
  } else if(viewId === 'calendar') {
    renderCalendar(currentYear, currentMonth);
  }
}

// ナビボタンにイベント設定
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.id.replace('btn-show-', '');
    switchView(target);
  });
});

// --- アーティスト検索 ---
// 仮に固定データで検索実装（後でAPIに変更可能）
const sampleArtists = [
  { name: "RADWIMPS", genre: "Rock", description: "日本のロックバンド。", officialWebsite: "https://radwimps.jp" },
  { name: "米津玄師", genre: "J-Pop", description: "日本のシンガーソングライター。", officialWebsite: "https://reissuerecords.net" },
  { name: "宇多田ヒカル", genre: "Pop", description: "日本の歌手、作詞家。", officialWebsite: "https://www.utadahikaru.jp" },
  { name: "BUMP OF CHICKEN", genre: "Rock", description: "日本のロックバンド。", officialWebsite: "https://www.bumpofchicken.com" },
];

function filterArtists(keyword) {
  if (!keyword) return [];
  keyword = keyword.toLowerCase();
  return sampleArtists.filter(a => a.name.toLowerCase().includes(keyword));
}

artistSearchInput.addEventListener('input', () => {
  const keyword = artistSearchInput.value.trim();
  artistSuggestionsDiv.innerHTML = '';
  artistInfoDiv.innerHTML = '';
  addArtistBtn.disabled = true;
  selectedArtist = null;

  if (keyword.length === 0) return;

  const results = filterArtists(keyword);
  if (results.length === 0) {
    artistSuggestionsDiv.textContent = '該当するアーティストが見つかりません。';
    return;
  }

  results.forEach(artist => {
    const div = document.createElement('div');
    div.textContent = artist.name;
    div.addEventListener('click', () => {
      selectedArtist = artist;
      showArtistInfo(artist);
      artistSuggestionsDiv.innerHTML = '';
      addArtistBtn.disabled = false;
    });
    artistSuggestionsDiv.appendChild(div);
  });
});

function showArtistInfo(artist) {
  artistInfoDiv.innerHTML = `
    <h3>${artist.name}</h3>
    <p><strong>ジャンル:</strong> ${artist.genre}</p>
    <p>${artist.description}</p>
    <p><a href="${artist.officialWebsite}" target="_blank" rel="noopener noreferrer" style="color:#f48fb1;">公式サイトへ</a></p>
  `;
}

// --- マイアーティスト管理 ---
function loadMyArtists() {
  const data = localStorage.getItem('myArtists');
  myArtists = data ? JSON.parse(data) : [];
}

function saveMyArtists() {
  localStorage.setItem('myArtists', JSON.stringify(myArtists));
}

function renderMyArtists() {
  myArtistListUl.innerHTML = '';
  if (myArtists.length === 0) {
    myArtistListUl.innerHTML = '<li>まだアーティストが登録されていません。</li>';
    return;
  }
  myArtists.forEach(artist => {
    const li = document.createElement('li');
    li.textContent = artist.name;
    // 削除ボタン
    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.style.marginLeft = '10px';
    delBtn.style.cursor = 'pointer';
    delBtn.addEventListener('click', () => {
      myArtists = myArtists.filter(a => a.name !== artist.name);
      saveMyArtists();
      renderMyArtists();
      addNotification(`アーティスト「${artist.name}」を削除しました。`);
    });
    li.appendChild(delBtn);
    myArtistListUl.appendChild(li);
  });
}

// --- 通知機能 ---
function loadNotifications() {
  const data = localStorage.getItem('notifications');
  notifications = data ? JSON.parse(data) : [];
}

function saveNotifications() {
  localStorage.setItem('notifications', JSON.stringify(notifications));
}

function addNotification(text) {
  const now = new Date();
  notifications.unshift({ text, time: now.toLocaleTimeString() });
  saveNotifications();
  renderNotifications();
}

function renderNotifications() {
  notificationListUl.innerHTML = '';
  if (notifications.length === 0) {
    notificationListUl.innerHTML = '<li>通知はありません。</li>';
    return;
  }
  notifications.forEach(n => {
    const li = document.createElement('li');
    li.textContent = `[${n.time}] ${n.text}`;
    notificationListUl.appendChild(li);
  });
}

// --- 「マイアーティストに追加」ボタンイベント ---
addArtistBtn.addEventListener('click', () => {
  if (!selectedArtist) return;
  if (myArtists.some(a => a.name === selectedArtist.name)) {
    alert('既に登録されています');
    return;
  }
  myArtists.push(selectedArtist);
  saveMyArtists();
  renderMyArtists();
  addNotification(`アーティスト「${selectedArtist.name}」をマイアーティストに追加しました。`);
  addArtistBtn.disabled = true;
  artistInfoDiv.innerHTML = '';
  artistSearchInput.value = '';
});

// --- カレンダーイベント保存・読込 ---
function loadEvents() {
  const data = localStorage.getItem('events');
  events = data ? JSON.parse(data) : {};
}

function saveEvents() {
  localStorage.setItem('events', JSON.stringify(events));
}

// --- カレンダー機能（簡易版） ---
function renderCalendar(year, month) {
  calendarBody.innerHTML = '';
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay(); // 日曜=0
  const daysInMonth = lastDay.getDate();

  monthYearSpan.textContent = `${year}年 ${month + 1}月`;

  for (let week = 0; week < 6; week++) {
    let row = '<tr>';
    for (let day = 0; day < 7; day++) {
      if (week === 0 && day < startDayOfWeek) {
        row += '<td></td>';
      } else {
        const dayCount = week * 7 + day - startDayOfWeek + 1;
        if (dayCount > daysInMonth) {
          row += '<td></td>';
        } else {
          const today = new Date();
          const isToday = (dayCount === today.getDate() && month === today.getMonth() && year === today.getFullYear());
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`;
          const hasEvent = events[dateStr] && events[dateStr].length > 0;
          row += `<td class="${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}" data-date="${dateStr}">${dayCount}${hasEvent ? '★' : ''}</td>`;
        }
      }
    }
    row += '</tr>';
    calendarBody.innerHTML += row;
  }
  // 日付セルクリックイベント再設定
  Array.from(calendarBody.querySelectorAll('td[data-date]')).forEach(td => {
    td.addEventListener('click', () => {
      const date = td.getAttribute('data-date');
      showEventInput(date);
    });
  });
}

function showEventInput(dateStr) {
  eventInputDiv.classList.remove('hidden');
  selectedDateP.textContent = dateStr;
  eventTextInput.value = '';
  // 予定リスト表示
  const eventListDivId = 'event-list-div';
  let eventListDiv = document.getElementById(eventListDivId);
  if (!eventListDiv) {
    eventListDiv = document.createElement('div');
    eventListDiv.id = eventListDivId;
    eventInputDiv.insertBefore(eventListDiv, eventTextInput);
  }
  eventListDiv.innerHTML = '';
  if (events[dateStr] && events[dateStr].length > 0) {
    const ul = document.createElement('ul');
    events[dateStr].forEach((ev, idx) => {
      const li = document.createElement('li');
      li.textContent = ev;
      // 削除ボタン
      const delBtn = document.createElement('button');
      delBtn.textContent = '削除';
      delBtn.style.marginLeft = '8px';
      delBtn.onclick = () => {
        events[dateStr].splice(idx, 1);
        if (events[dateStr].length === 0) delete events[dateStr];
        saveEvents();
        showEventInput(dateStr);
        addNotification(`${dateStr} の予定「${ev}」を削除しました。`);
        renderCalendar(currentYear, currentMonth);
      };
      li.appendChild(delBtn);
      ul.appendChild(li);
    });
    eventListDiv.appendChild(ul);
  } else {
    eventListDiv.textContent = 'この日に予定はありません。';
  }
  // 入力欄にはカンマ区切りで既存予定を表示
  if (events[dateStr]) {
    eventTextInput.value = events[dateStr].join(', ');
  }
  eventInputDiv.setAttribute('data-date', dateStr);
}

saveEventBtn.addEventListener('click', () => {
  const dateStr = eventInputDiv.getAttribute('data-date');
  const text = eventTextInput.value.trim();
  if (!dateStr) return;
  if (text) {
    // カンマ区切りで複数予定を保存
    const newEvents = text.split(',').map(t => t.trim()).filter(t => t);
    const before = events[dateStr] ? [...events[dateStr]] : [];
    events[dateStr] = newEvents;
    saveEvents();
    renderCalendar(currentYear, currentMonth);
    eventInputDiv.classList.add('hidden');
    // 通知
    if (before.length === 0 && newEvents.length > 0) {
      addNotification(`${dateStr} に予定「${newEvents.join('」「')}」を追加しました。`);
    } else if (before.join() !== newEvents.join()) {
      addNotification(`${dateStr} の予定を更新しました: 「${newEvents.join('」「')}」`);
    } else {
      addNotification(`${dateStr} の予定は変更ありません。`);
    }
  } else {
    if (events[dateStr]) {
      delete events[dateStr];
      saveEvents();
      renderCalendar(currentYear, currentMonth);
      addNotification(`${dateStr} の予定をすべて削除しました。`);
    }
    eventInputDiv.classList.add('hidden');
  }
});

// 月移動ボタン
prevMonthBtn.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentYear, currentMonth);
});
nextMonthBtn.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentYear, currentMonth);
});

// --- 初期化 ---
window.addEventListener('DOMContentLoaded', () => {
  loadMyArtists();
  loadNotifications();
  loadEvents();
  renderMyArtists();
  renderNotifications();
  renderCalendar(currentYear, currentMonth);
});
