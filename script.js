document.addEventListener('DOMContentLoaded', () => {
  const btnSearch = document.getElementById('btn-show-search');
  const btnCal = document.getElementById('btn-show-calendar');
  const btnMa = document.getElementById('btn-show-myartists');
  const btnNot = document.getElementById('btn-show-notifications');
  const sections = {
    search: document.getElementById('section-search'),
    calendar: document.getElementById('section-calendar'),
    myartists: document.getElementById('section-myartists'),
    notifications: document.getElementById('section-notifications')
  };
  const artistInput = document.getElementById('artist-search-input');
  const sugg = document.getElementById('artist-suggestions');
  const info = document.getElementById('artist-info');
  const myList = document.getElementById('my-artist-list');
  const notList = document.getElementById('notification-list');

  let myArtists = [];
  let notifications = [];

  function showSection(key) {
    Object.keys(sections).forEach(k => {
      sections[k].classList.toggle('active', k === key);
    });
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    {
      const map = { search: btnSearch, calendar: btnCal, myartists: btnMa, notifications: btnNot };
      map[key].classList.add('active');
    }
    if (key === 'calendar') renderCalendar();
    else if (window.calendar) { window.calendar.destroy(); window.calendar = null; }
  }

  btnSearch.onclick = () => showSection('search');
  btnCal.onclick = () => showSection('calendar');
  btnMa.onclick = () => { showSection('myartists'); renderMyArtists(); };
  btnNot.onclick = () => { showSection('notifications'); renderNotifications(); };

  function renderMyArtists() {
    myList.innerHTML = myArtists.length
      ? myArtists.map(a => `<li>${a.name}</li>`).join('')
      : '<li>登録なし</li>';
  }

  function renderNotifications() {
    notList.innerHTML = notifications.length
      ? notifications.map(n => `<li>${n.date} - ${n.text}</li>`).join('')
      : '<li>通知なし</li>';
  }

  function notify(text) {
    const now = new Date().toLocaleTimeString();
    notifications.push({ text, date: now });
    renderNotifications();
    if (Notification.permission === 'granted') new Notification('通知', { body: text });
  }

  const sample = [
    { name: '米津玄師', genre: 'J‑Pop', description: 'シンガーソングライター', website: '#' },
    { name: 'YOASOBI', genre: 'J‑Pop', description: '物語的な楽曲', website: '#' },
    { name: 'Aimer', genre: 'J‑Pop/ロック', description: '幻想的な歌声', website: '#' }
  ];
  function filterArtists(q) { return sample.filter(a => a.name.includes(q)); }

  artistInput.oninput = e => {
    const q = e.target.value.trim();
    sugg.innerHTML = '';
    info.innerHTML = '';
    if (!q) return;
    filterArtists(q).forEach(a => {
      const d = document.createElement('div');
      d.textContent = a.name;
      d.onclick = () => {
        info.innerHTML = `
          <h3>${a.name}</h3>
          <p>${a.genre}</p>
          <p>${a.description}</p>
          <a href="${a.website}" target="_blank">公式サイト</a>
          <button id="addArtistBtn">マイアーティストに追加</button>`;
        document.getElementById('addArtistBtn').onclick = () => {
          if (!myArtists.find(x => x.name === a.name)) {
            myArtists.push(a);
            notify(`${a.name} を登録しました`);
            renderMyArtists();
          } else alert('すでにあり');
        };
        sugg.innerHTML = '';
      };
      sugg.append(d);
    });
  };

  window.calendar = null;
  function renderCalendar() {
    if (!window.calendar) {
      window.calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        initialView: 'dayGridMonth',
        events: myArtists.map(a => ({ title: a.name, start: new Date().toISOString().split('T')[0], allDay: true })),
        height: 550
      });
      window.calendar.render();
    }
  }

  if (Notification.permission !== 'granted') Notification.requestPermission();
  showSection('search');
});
