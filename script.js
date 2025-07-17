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
const eventColorInput = document.getElementById('eventColor');
const saveEventBtn = document.getElementById('saveEvent');
const eventDetailPanel = document.getElementById('eventDetailPanel');
const eventDetailContent = document.getElementById('eventDetailContent');

let currentView = 'search'; // 現在表示中のセクションID
let selectedArtist = null; // 現在選択中のアーティストオブジェクト
let myArtists = [];
let notifications = [];
let events = {}; // { 'YYYY-MM-DD': [{ name: 'イベント1', color: '#f48fb1' }, { name: 'イベント2', color: '#4db6ac' }] }

let today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth();

let sampleArtists = [];

// --- アーティストデータの読み込み ---
async function loadArtists() {
  try {
    const res = await fetch('data/artists.json');
    if (!res.ok) throw new Error('アーティストデータの取得に失敗しました');
    sampleArtists = await res.json();
  } catch (e) {
    sampleArtists = [];
    console.error(e);
  }
}

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
    if (eventInputDiv) eventInputDiv.classList.add('hidden'); // カレンダー切替時に予定入力欄を必ず隠す
  }
}

// ナビボタンにイベント設定
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.id.replace('btn-show-', '');
    switchView(target);
  });
});

// --- 文字列正規化（ひらがな・カタカナ・ローマ字・全角半角対応） ---
function normalize(str) {
  if (!str) return '';
  // 全角→半角
  str = str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
  // カタカナ→ひらがな
  str = str.replace(/[ァ-ン]/g, s => String.fromCharCode(s.charCodeAt(0) - 0x60));
  // 小文字カタカナ→ひらがな
  str = str.replace(/ヵ/g, 'か').replace(/ヶ/g, 'け').replace(/ッ/g, 'つ').replace(/ャ/g, 'や').replace(/ュ/g, 'ゆ').replace(/ョ/g, 'よ');
  // ローマ字は小文字化
  str = str.toLowerCase();
  // スペース・記号除去
  str = str.replace(/\s|\-|\_|\./g, '');
  return str;
}

// --- ローカル候補の多言語対応フィルタ ---
function filterArtists(keyword) {
  if (!keyword) return [];
  const normKey = normalize(keyword);
  return sampleArtists.filter(a => {
    // name, description, genre, romaji（あれば）で比較
    const fields = [a.name, a.genre, a.description, a.romaji].filter(Boolean);
    return fields.some(f => normalize(f).includes(normKey));
  });
}

// --- MusicBrainz APIからアーティスト検索 ---
async function searchArtistsFromAPI(keyword) {
  const url = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(keyword)} AND country:JP&fmt=json&limit=10&inc=aliases`;
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('API取得失敗');
    const data = await res.json();
    // APIのartist配列から必要な情報を抽出
    return data.artists.map(a => {
      // aliasやローマ字名も候補に使う
      let romaji = '';
      if (a.aliases) {
        const roma = a.aliases.find(al => /latin|ローマ字/i.test(al.script) || /romaji/i.test(al.name));
        if (roma) romaji = roma.name;
      }
      return {
        name: a.name,
        genre: a['type'] || '',
        description: a.disambiguation || '',
        officialWebsite: (a.relations && a.relations.find(r => r.type === 'official homepage')?.url?.resource) || '',
        romaji,
        _api: true // API候補フラグ
      };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

artistSearchInput.addEventListener('input', async () => {
  const keyword = artistSearchInput.value.trim();
  artistSuggestionsDiv.innerHTML = '';
  artistInfoDiv.innerHTML = '';
  addArtistBtn.disabled = true;
  selectedArtist = null;

  if (keyword.length === 0) return;

  // データが未ロードならロード
  if (sampleArtists.length === 0) await loadArtists();

  let results = filterArtists(keyword);

  // ローカル候補が5件未満ならAPIも利用
  let apiResults = [];
  if (results.length < 5) {
    artistSuggestionsDiv.textContent = 'APIから取得中...';
    apiResults = await searchArtistsFromAPI(keyword);
    // ローカル候補と重複しないものだけ追加
    const localNames = new Set(results.map(a => normalize(a.name)));
    apiResults.forEach(a => {
      if (!localNames.has(normalize(a.name))) results.push(a);
    });
  }

  if (results.length === 0) {
    artistSuggestionsDiv.textContent = '該当するアーティストが見つかりません。';
    return;
  }

  artistSuggestionsDiv.innerHTML = '';
  results.forEach(artist => {
    const div = document.createElement('div');
    div.textContent = artist.name + (artist._api ? ' (API)' : '');
    div.title = [artist.romaji, artist.genre, artist.description].filter(Boolean).join(' / ');
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
    li.className = 'artist-card';
    // アーティスト名
    const nameDiv = document.createElement('div');
    nameDiv.className = 'artist-name';
    nameDiv.textContent = artist.name;
    li.appendChild(nameDiv);
    // ジャンル・説明
    if (artist.genre || artist.description) {
      const infoDiv = document.createElement('div');
      infoDiv.className = 'artist-info-mini';
      if (artist.genre) infoDiv.innerHTML += `<span class='artist-genre'>${artist.genre}</span> `;
      if (artist.description) infoDiv.innerHTML += `<span class='artist-desc'>${artist.description}</span>`;
      li.appendChild(infoDiv);
    }
    // 公式サイト
    if (artist.officialWebsite) {
      const link = document.createElement('a');
      link.href = artist.officialWebsite;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'artist-link-btn';
      link.textContent = '公式サイトへ';
      li.appendChild(link);
    }
    // 削除ボタン
    const delBtn = document.createElement('button');
    delBtn.textContent = '×';
    delBtn.className = 'artist-del-btn';
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
          let cellContent = `<div>${dayCount}</div>`;
          if (events[dateStr] && events[dateStr].length > 0) {
            // 予定名を色付きで表示
            cellContent += events[dateStr].map(ev => `<span class="event-label" style="background:${ev.color || '#f48fb1'};">${ev.name}</span>`).join('');
          }
          row += `<td class="${isToday ? 'today' : ''} ${events[dateStr] && events[dateStr].length > 0 ? 'has-event' : ''}" data-date="${dateStr}">${cellContent}</td>`;
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
      showEventDetail(date);
    });
  });
}

function showEventInput(dateStr) {
  eventInputDiv.classList.remove('hidden');
  selectedDateP.textContent = dateStr;
  eventTextInput.value = '';
  eventColorInput.value = '#f48fb1';
  // event-list-divは廃止
  // 入力欄には最初の予定名と色を表示（複数予定の場合は空欄）
  if (events[dateStr] && events[dateStr].length === 1) {
    eventTextInput.value = events[dateStr][0].name;
    eventColorInput.value = events[dateStr][0].color || '#f48fb1';
  }
  eventInputDiv.setAttribute('data-date', dateStr);
}

saveEventBtn.addEventListener('click', () => {
  const dateStr = eventInputDiv.getAttribute('data-date');
  const text = eventTextInput.value.trim();
  const color = eventColorInput.value;
  if (!dateStr) return;
  if (text) {
    // カンマ区切りで複数予定を保存
    const newEvents = text.split(',').map(t => t.trim()).filter(t => t).map(name => ({ name, color }));
    const before = events[dateStr] ? [...events[dateStr]] : [];
    events[dateStr] = newEvents;
    saveEvents();
    renderCalendar(currentYear, currentMonth);
    eventInputDiv.classList.add('hidden');
    showEventDetail(dateStr);
    // 通知
    if (before.length === 0 && newEvents.length > 0) {
      addNotification(`${dateStr} に予定「${newEvents.map(e=>e.name).join('」「')}」を追加しました。`);
    } else if (JSON.stringify(before) !== JSON.stringify(newEvents)) {
      addNotification(`${dateStr} の予定を更新しました: 「${newEvents.map(e=>e.name).join('」「')}」`);
    } else {
      addNotification(`${dateStr} の予定は変更ありません。`);
    }
  } else {
    if (events[dateStr]) {
      delete events[dateStr];
      saveEvents();
      renderCalendar(currentYear, currentMonth);
      showEventDetail(dateStr);
      addNotification(`${dateStr} の予定をすべて削除しました。`);
    }
    eventInputDiv.classList.add('hidden');
  }
});

function showEventDetail(dateStr) {
  if (!eventDetailContent) return;
  // 予定リストを右パネルにのみ表示
  if (events[dateStr] && events[dateStr].length > 0) {
    const ul = document.createElement('ul');
    events[dateStr].forEach((ev, idx) => {
      const li = document.createElement('li');
      li.textContent = ev.name;
      li.style.background = ev.color || '#f48fb1';
      // 削除ボタン
      const delBtn = document.createElement('button');
      delBtn.textContent = '削除';
      delBtn.className = 'del-btn';
      delBtn.onclick = () => {
        events[dateStr].splice(idx, 1);
        if (events[dateStr].length === 0) delete events[dateStr];
        saveEvents();
        renderCalendar(currentYear, currentMonth);
        showEventDetail(dateStr);
        addNotification(`${dateStr} の予定「${ev.name}」を削除しました。`);
      };
      li.appendChild(delBtn);
      ul.appendChild(li);
    });
    eventDetailContent.innerHTML = '';
    eventDetailContent.appendChild(ul);
  } else {
    eventDetailContent.innerHTML = 'この日に予定はありません。';
  }
}

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
window.addEventListener('DOMContentLoaded', async () => {
  await loadArtists();
  loadMyArtists();
  loadNotifications();
  loadEvents();
  renderMyArtists();
  renderNotifications();
  renderCalendar(currentYear, currentMonth);
});
