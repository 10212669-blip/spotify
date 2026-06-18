/* ════════════════════════════════════════════
   MUSIC PLAYER — player.js
   ════════════════════════════════════════════

   CÓMO AGREGAR CANCIONES:
   Edita el array `songs` más abajo.

   {
     title:  "Nombre",
     artist: "Artista",
     album:  "Álbum",           // para la pestaña Álbumes
     folder: "music",           // para la pestaña Carpetas
     src:    "music/1.mp3",     // ruta al archivo mp3
     emoji:  "🎵",              // emoji de carátula
     cover:  "",                // ruta a imagen de portada (opcional)
     grad:   "linear-gradient(160deg,#c0355a 0%,#9b3fcf 45%,#2a3fa0 100%)",
     accent: "#b06df0",
   }

   ════════════════════════════════════════════ */

const songs = [
  {
    title:  "NO PIERDO LA VIDA",
    artist: "chuyin",
    album:  "Sin Álbum",
    folder: "music",
    src:    "music/1.mp3",
    emoji:  "🎵",
    cover:  "",
    grad:   "linear-gradient(160deg,#c0355a 0%,#9b3fcf 45%,#2a3fa0 100%)",
    accent: "#b06df0",
  },
 

{
  title:"Simpons",
  artist:"Bad Bunny",
  album:"Sin Álbum",
  folder:"music",
  src:"music/Simpons.mp3",
  emoji:"🎵",
  cover:"",
  grad:"linear-gradient(160deg,#ff6b6b,#ee5a24,#6c5ce7)",
  accent:"#ff6b6b"
},

{
  title:"Tatto",
  artist:"Tito DoubleP",
  album:"Sin Álbum",
  folder:"music",
  src:"music/Tatto.mp3",
  emoji:"🎵",
  cover:"",
  grad:"linear-gradient(160deg,#00b894,#00cec9,#0984e3)",
  accent:"#00cec9"
},

{
  title:"Tu boda",
  artist:"Fuerza Regida",
  album:"Sin Álbum",
  folder:"music",
  src:"music/Tu boda.mp3",
  emoji:"🎵",
  cover:"",
  grad:"linear-gradient(160deg,#fdcb6e,#e17055,#d63031)",
  accent:"#fdcb6e"
},

{
  title:"Tu y yo",
  artist:"Grupo Firme",
  album:"Sin Álbum",
  folder:"music",
  src:"music/Tu y yo.mp3",
  emoji:"🎵",
  cover:"",
  grad:"linear-gradient(160deg,#6c5ce7,#a29bfe,#74b9ff)",
  accent:"#a29bfe"
},

{
  title:"vete ya",
  artist:"Valetin Elizalde",
  album:"Sin Álbum",
  folder:"music",
  src:"music/vete ya.mp3",
  emoji:"🎵",
  cover:"",
  grad:"linear-gradient(160deg,#e84393,#fd79a8,#fab1a0)",
  accent:"#fd79a8"
},

{
  title:"vss",
  artist:"Peso Pluma",
  album:"Sin Álbum",
  folder:"music",
  src:"music/vss.mp3",
  emoji:"🎵",
  cover:"",
  grad:"linear-gradient(160deg,#00cec9,#55efc4,#81ecec)",
  accent:"#55efc4"
}
];

/* ════════════════════════════════════════════
   PLAYLISTS — se guardan en localStorage
   ════════════════════════════════════════════ */
let playlists = loadPlaylists();

function loadPlaylists() {
  try {
    const raw = localStorage.getItem('mp_playlists');
    return raw ? JSON.parse(raw) : defaultPlaylists();
  } catch { return defaultPlaylists(); }
}
function defaultPlaylists() {
  return [
    { id: 'favs',    name: 'Favoritos',    emoji: '❤️',  songs: [] },
    { id: 'recent',  name: 'Recientes',    emoji: '🕐',  songs: [] },
  ];
}
function savePlaylists() {
  try { localStorage.setItem('mp_playlists', JSON.stringify(playlists)); } catch {}
}

/* ════════════════════════════════════════════
   AUDIO
   ════════════════════════════════════════════ */
const audio = new Audio();
audio.volume = 0.8;

audio.addEventListener('ended', () => {
  if (repeat) { audio.currentTime = 0; audio.play(); }
  else nextSong();
});

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  const fill  = $('progressFill');
  const thumb = $('progressThumb');
  const mini  = $('miniProgress');
  if (fill)  fill.style.width = pct + '%';
  if (thumb) thumb.style.left = pct + '%';
  if (mini)  mini.style.width = pct + '%';
  $('curTime').textContent = fmt(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  $('durTime').textContent = fmt(audio.duration);
});

/* ════════════════════════════════════════════
   ESTRELLAS
   ════════════════════════════════════════════ */
(function initStars() {
  const canvas = $('stars');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let stars = [];
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.2,
      a: Math.random(),
      da:(Math.random() * .004 + .001) * (Math.random() < .5 ? 1 : -1),
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a = Math.max(.05, Math.min(1, s.a + s.da));
      if (s.a <= .05 || s.a >= 1) s.da *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  resize(); draw();
})();

/* ════════════════════════════════════════════
   ESTADO
   ════════════════════════════════════════════ */
let cur         = 0;
let playing     = false;
let shuffle     = false;
let repeat      = false;
let currentTab  = 'canciones';
let sortedSongs = [...songs];   // copia que se puede ordenar/filtrar
let searchQuery = '';
let editingPlaylistId = null;   // null = nueva, string = editar
let selectedEmoji = '🎵';

/* Helper */
function $(id) { return document.getElementById(id); }

/* ════════════════════════════════════════════
   FORMAT
   ════════════════════════════════════════════ */
function fmt(s) {
  s = Math.floor(s);
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

/* ════════════════════════════════════════════
   TEMA / CARGA
   ════════════════════════════════════════════ */
function applyTheme(i) {
  const s    = songs[i];
  const grad = s.grad || 'linear-gradient(160deg,#c0355a 0%,#9b3fcf 45%,#2a3fa0 100%)';
  const bg   = $('playerBg');
  if (bg) bg.style.background = grad;

  const bigArt   = $('bigArt');
  const bigImg   = $('bigImg');
  const bigEmoji = $('bigEmoji');
  if (s.cover) {
    if (bigImg)   { bigImg.src = s.cover; bigImg.style.display = 'block'; }
    if (bigEmoji) bigEmoji.style.display = 'none';
    if (bigArt)   bigArt.style.background = 'none';
  } else {
    if (bigImg)   bigImg.style.display = 'none';
    if (bigEmoji) { bigEmoji.style.display = 'block'; bigEmoji.textContent = s.emoji || '♪'; }
    if (bigArt)   bigArt.style.background = grad;
  }

  const miniArt = $('miniArt');
  if (miniArt) {
    if (s.cover) {
      miniArt.innerHTML = `<img src="${s.cover}" alt=""/>`;
    } else {
      miniArt.innerHTML = s.emoji || '♪';
      miniArt.style.background = grad;
    }
  }
}

function loadSong(i) {
  cur = i;
  const s = songs[i];
  audio.src = s.src; audio.load();

  $('playerTitle').textContent  = s.title;
  $('playerArtist').textContent = s.artist || '<unknown>';
  $('miniTitle').textContent    = s.title;
  $('miniArtist').textContent   = s.artist || '<unknown>';
  $('curTime').textContent      = '0:00';
  $('durTime').textContent      = '0:00';

  const fill  = $('progressFill');
  const thumb = $('progressThumb');
  const mini  = $('miniProgress');
  if (fill)  fill.style.width = '0%';
  if (thumb) thumb.style.left = '0%';
  if (mini)  mini.style.width = '0%';

  const fav = $('favBtn');
  if (fav) fav.className = 'side-btn' + (isInPlaylist('favs', i) ? ' active' : '');

  applyTheme(i);

  // Agregar a recientes
  addToRecentPlaylist(i);

  renderCurrentTab();
  renderQueue();
}

function addToRecentPlaylist(songIndex) {
  const pl = playlists.find(p => p.id === 'recent');
  if (!pl) return;
  pl.songs = pl.songs.filter(s => s !== songIndex);
  pl.songs.unshift(songIndex);
  if (pl.songs.length > 30) pl.songs = pl.songs.slice(0, 30);
  savePlaylists();
}

/* ════════════════════════════════════════════
   REPRODUCCIÓN
   ════════════════════════════════════════════ */
function togglePlay() {
  if (!songs.length) return;
  if (playing) { audio.pause(); playing = false; }
  else { audio.play().catch(e => console.warn('Autoplay:', e)); playing = true; }
  updatePlayUI();
  renderCurrentTab();
  renderQueue();
}

function updatePlayUI() {
  const icon    = $('playIcon');
  const miniBtn = $('miniPlayBtn');
  if (playing) {
    if (icon)    icon.textContent    = '⏸';
    if (miniBtn) miniBtn.textContent = '⏸';
  } else {
    if (icon)    icon.textContent    = '▶';
    if (miniBtn) miniBtn.textContent = '▶';
  }
}

function nextSong() {
  if (!songs.length) return;
  let n;
  if (shuffle) { do { n = Math.floor(Math.random() * songs.length); } while (n === cur && songs.length > 1); }
  else n = (cur + 1) % songs.length;
  loadSong(n);
  if (playing) audio.play();
}

function prevSong() {
  if (!songs.length) return;
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  loadSong((cur - 1 + songs.length) % songs.length);
  if (playing) audio.play();
}

function shuffleAll() {
  if (!songs.length) return;
  shuffle = true;
  $('shuffleBtn')?.classList.add('active');
  loadSong(Math.floor(Math.random() * songs.length));
  playing = false; togglePlay(); openPlayer();
}

function playAll() {
  if (!songs.length) return;
  loadSong(0); playing = false; togglePlay(); openPlayer();
}

function toggleShuffle() {
  shuffle = !shuffle;
  $('shuffleBtn')?.classList.toggle('active', shuffle);
}

function toggleRepeat() {
  repeat = !repeat;
  $('repeatBtn')?.classList.toggle('active', repeat);
}

/* ════════════════════════════════════════════
   FAVORITOS
   ════════════════════════════════════════════ */
function toggleFav() {
  const favPl = playlists.find(p => p.id === 'favs');
  if (!favPl) return;
  if (favPl.songs.includes(cur)) {
    favPl.songs = favPl.songs.filter(s => s !== cur);
    showToast('Quitado de Favoritos');
  } else {
    favPl.songs.push(cur);
    showToast('Agregado a Favoritos ❤️');
  }
  savePlaylists();
  const btn = $('favBtn');
  if (btn) btn.className = 'side-btn' + (favPl.songs.includes(cur) ? ' active' : '');
  if (currentTab === 'playlists') renderCurrentTab();
}

function isInPlaylist(plId, songIdx) {
  const pl = playlists.find(p => p.id === plId);
  return pl ? pl.songs.includes(songIdx) : false;
}

/* ════════════════════════════════════════════
   PLAYLISTS — CRUD
   ════════════════════════════════════════════ */
const PLAYLIST_EMOJIS = ['🎵','🎶','🔥','💜','❤️','⭐','🌙','🎸','🎤','🥶','😤','🌊','🎯','💫','🎭','🎪'];

function openCreatePlaylist() {
  editingPlaylistId = null;
  $('modalPlaylistTitle').textContent = 'Nueva Playlist';
  $('playlistNameInput').value = '';
  selectedEmoji = '🎵';
  renderEmojiPicker();
  openModal('modalPlaylist');
  setTimeout(() => $('playlistNameInput').focus(), 300);
}

function openEditPlaylist(id) {
  const pl = playlists.find(p => p.id === id);
  if (!pl) return;
  editingPlaylistId = id;
  $('modalPlaylistTitle').textContent = 'Editar Playlist';
  $('playlistNameInput').value = pl.name;
  selectedEmoji = pl.emoji || '🎵';
  renderEmojiPicker();
  openModal('modalPlaylist');
}

function renderEmojiPicker() {
  const row = $('playlistEmojiRow');
  row.innerHTML = '';
  PLAYLIST_EMOJIS.forEach(em => {
    const btn = document.createElement('span');
    btn.className = 'emoji-opt' + (em === selectedEmoji ? ' selected' : '');
    btn.textContent = em;
    btn.onclick = () => {
      selectedEmoji = em;
      renderEmojiPicker();
    };
    row.appendChild(btn);
  });
}

function savePlaylist() {
  const name = $('playlistNameInput').value.trim();
  if (!name) { $('playlistNameInput').focus(); return; }

  if (editingPlaylistId) {
    const pl = playlists.find(p => p.id === editingPlaylistId);
    if (pl) { pl.name = name; pl.emoji = selectedEmoji; }
    showToast('Playlist actualizada ✓');
  } else {
    playlists.push({
      id:    'pl_' + Date.now(),
      name:  name,
      emoji: selectedEmoji,
      songs: [],
    });
    showToast('Playlist creada ✓');
  }
  savePlaylists();
  closeModal('modalPlaylist');
  if (currentTab === 'playlists') renderCurrentTab();
}

function deletePlaylist(id) {
  if (['favs','recent'].includes(id)) { showToast('No puedes borrar esta lista'); return; }
  playlists = playlists.filter(p => p.id !== id);
  savePlaylists();
  renderCurrentTab();
  showToast('Playlist eliminada');
}

function openAddToPlaylist() {
  renderAddToList();
  openModal('modalAddTo');
}

function renderAddToList() {
  const container = $('addToList');
  container.innerHTML = '';
  playlists.forEach(pl => {
    const item = document.createElement('div');
    item.className = 'modal-list-item';
    const inList = pl.songs.includes(cur);
    item.innerHTML = `
      <span class="modal-list-emoji">${pl.emoji}</span>
      <span class="modal-list-name">${pl.name}</span>
      <span style="margin-left:auto;font-size:13px;color:${inList ? 'var(--accent)' : 'var(--subtext)'}">
        ${inList ? '✓' : '＋'}
      </span>`;
    item.onclick = () => {
      if (inList) {
        pl.songs = pl.songs.filter(s => s !== cur);
        showToast(`Quitado de ${pl.name}`);
      } else {
        pl.songs.push(cur);
        showToast(`Agregado a ${pl.name} ✓`);
      }
      savePlaylists();
      renderAddToList();
      if (currentTab === 'playlists') renderCurrentTab();
    };
    container.appendChild(item);
  });
}

/* ════════════════════════════════════════════
   MENÚ DE CANCIÓN (⋮)
   ════════════════════════════════════════════ */
let songMenuIndex = -1;

function openSongMenu(index) {
  songMenuIndex = (index !== undefined) ? index : cur;
  const s = songs[songMenuIndex];
  $('songMenuTitle').textContent = s.title;
  openModal('modalSongMenu');
}

function songMenuFav() {
  cur = songMenuIndex;
  toggleFav();
  closeModal('modalSongMenu');
}
function songMenuPlaylist() {
  cur = songMenuIndex;
  closeModal('modalSongMenu');
  openAddToPlaylist();
}

/* ════════════════════════════════════════════
   BÚSQUEDA
   ════════════════════════════════════════════ */
function toggleSearch() {
  const bar = $('searchBar');
  bar.classList.toggle('hidden');
  if (!bar.classList.contains('hidden')) $('searchInput').focus();
  else { clearSearch(); }
}

function onSearch(q) {
  searchQuery = q.toLowerCase();
  renderCurrentTab();
}

function clearSearch() {
  $('searchInput').value = '';
  searchQuery = '';
  $('searchBar').classList.add('hidden');
  renderCurrentTab();
}

function filteredSongs() {
  if (!searchQuery) return sortedSongs;
  return sortedSongs.filter(s =>
    s.title.toLowerCase().includes(searchQuery) ||
    (s.artist || '').toLowerCase().includes(searchQuery)
  );
}

/* ════════════════════════════════════════════
   ORDENAR
   ════════════════════════════════════════════ */
function toggleSortMenu() {
  $('sortMenu').classList.toggle('hidden');
}

function sortSongs(by) {
  $('sortMenu').classList.add('hidden');
  if (by === 'default') {
    sortedSongs = [...songs];
  } else {
    sortedSongs = [...songs].sort((a, b) =>
      (a[by] || '').localeCompare(b[by] || '')
    );
  }
  renderCurrentTab();
}

/* ════════════════════════════════════════════
   PROGRESO — click
   ════════════════════════════════════════════ */
const progressWrap = $('progressWrap');
if (progressWrap) {
  progressWrap.addEventListener('click', function(e) {
    if (!songs.length || !audio.duration) return;
    const r   = this.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    audio.currentTime = pct * audio.duration;
  });
}

/* ════════════════════════════════════════════
   TABS
   ════════════════════════════════════════════ */
function setTab(el, tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  currentTab = tabName;
  renderCurrentTab();
}

function renderCurrentTab() {
  const listControls = $('listControls');
  const playRow      = $('playRow');
  const songList     = $('songList');
  if (!songList) return;

  const showControls = currentTab === 'canciones';
  if (listControls) listControls.style.display = showControls ? 'flex' : 'none';
  if (playRow)      playRow.style.display      = showControls ? 'flex' : 'none';

  // Limpiar el contenedor (puede tener grid o flex)
  songList.className = 'song-list';
  songList.innerHTML = '';

  switch (currentTab) {
    case 'canciones': renderSongs(songList);   break;
    case 'playlists': renderPlaylists(songList); break;
    case 'albumes':   renderAlbumes(songList); break;
    case 'carpetas':  renderCarpetas(songList); break;
  }
}

/* ─── CANCIONES ──────────────────────────── */
function renderSongs(list) {
  $('songCount').textContent = songs.length + (songs.length === 1 ? ' Canción' : ' Canciones');
  const data = filteredSongs();

  if (!data.length) {
    list.appendChild(emptyState('🎵', songs.length ? 'Sin resultados' : 'Sin canciones',
      songs.length ? 'Intenta con otro término' : 'Agrega canciones en player.js'));
    return;
  }

  data.forEach(s => {
    const i = songs.indexOf(s);
    const isActive = i === cur;
    const item = document.createElement('div');
    item.className = 'song-item' + (isActive ? ' active' : '');

    const thumb = s.cover
      ? `<div class="song-thumb"><img src="${s.cover}" alt=""/></div>`
      : `<div class="song-thumb" style="background:${s.grad || 'var(--surface2)'}"><span>${s.emoji || '♪'}</span></div>`;

    const eq = (isActive && playing)
      ? `<div class="eq-wrap"><div class="eq-b"></div><div class="eq-b"></div><div class="eq-b"></div></div>` : '';

    item.innerHTML = `
      ${thumb}
      <div class="song-item-info">
        <div class="song-item-name${isActive ? ' accent' : ''}">${s.title}</div>
        <div class="song-item-sub">${s.artist || '<unknown>'} · Music</div>
      </div>
      <div class="song-item-right">
        ${eq}
        <button class="song-more" onclick="event.stopPropagation();openSongMenu(${i})">⋮</button>
      </div>`;
    item.onclick = () => { loadSong(i); playing = false; togglePlay(); openPlayer(); };
    list.appendChild(item);
  });
}

/* ─── PLAYLISTS ──────────────────────────── */
function renderPlaylists(list) {
  list.style.padding = '0';
  list.style.overflow = 'visible';

  const grid = document.createElement('div');
  grid.className = 'playlist-grid';

  // Tarjeta "Nueva playlist"
  const newCard = document.createElement('div');
  newCard.className = 'new-playlist-card';
  newCard.innerHTML = `<span>＋</span><span>Nueva playlist</span>`;
  newCard.onclick = openCreatePlaylist;
  grid.appendChild(newCard);

  playlists.forEach(pl => {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.innerHTML = `
      <div class="playlist-card-art">${pl.emoji}</div>
      <div class="playlist-card-name">${pl.name}</div>
      <div class="playlist-card-count">${pl.songs.length} ${pl.songs.length === 1 ? 'canción' : 'canciones'}</div>
      <div class="playlist-card-actions">
        ${!['favs','recent'].includes(pl.id)
          ? `<button class="pl-action-btn" onclick="event.stopPropagation();openEditPlaylist('${pl.id}')">✏️</button>
             <button class="pl-action-btn" onclick="event.stopPropagation();deletePlaylist('${pl.id}')">🗑</button>`
          : ''}
        <button class="pl-action-btn" style="margin-left:auto" onclick="event.stopPropagation();playPlaylist('${pl.id}')">▶</button>
      </div>`;
    card.onclick = () => openPlaylistDetail(pl.id);
    grid.appendChild(card);
  });

  list.appendChild(grid);
}

function playPlaylist(plId) {
  const pl = playlists.find(p => p.id === plId);
  if (!pl || !pl.songs.length) { showToast('Playlist vacía'); return; }
  loadSong(pl.songs[0]); playing = false; togglePlay(); openPlayer();
}

function openPlaylistDetail(plId) {
  const pl = playlists.find(p => p.id === plId);
  if (!pl) return;
  const list = $('songList');
  list.style.padding = '';
  list.innerHTML = '';

  const backRow = document.createElement('div');
  backRow.className = 'back-row';
  backRow.innerHTML = `
    <button onclick="renderCurrentTab()">‹ Playlists</button>
    <span>${pl.emoji} ${pl.name}</span>`;
  list.appendChild(backRow);

  if (!pl.songs.length) {
    list.appendChild(emptyState(pl.emoji, 'Vacía', 'Agrega canciones desde el reproductor con ＋'));
    return;
  }

  pl.songs.forEach(i => {
    const s = songs[i];
    if (!s) return;
    const isActive = i === cur;
    const item = document.createElement('div');
    item.className = 'song-item' + (isActive ? ' active' : '');
    const thumb = s.cover
      ? `<div class="song-thumb"><img src="${s.cover}" alt=""/></div>`
      : `<div class="song-thumb" style="background:${s.grad || 'var(--surface2)'}"><span>${s.emoji || '♪'}</span></div>`;
    const eq = (isActive && playing)
      ? `<div class="eq-wrap"><div class="eq-b"></div><div class="eq-b"></div><div class="eq-b"></div></div>` : '';
    item.innerHTML = `
      ${thumb}
      <div class="song-item-info">
        <div class="song-item-name${isActive ? ' accent' : ''}">${s.title}</div>
        <div class="song-item-sub">${s.artist || '<unknown>'}</div>
      </div>
      <div class="song-item-right">${eq}<button class="song-more" onclick="event.stopPropagation()">⋮</button></div>`;
    item.onclick = () => { loadSong(i); playing = false; togglePlay(); openPlayer(); };
    list.appendChild(item);
  });
}

/* ─── ÁLBUMES ────────────────────────────── */
function renderAlbumes(list) {
  list.style.padding = '0';
  const albums = {};
  songs.forEach((s, i) => {
    const k = s.album || 'Sin Álbum';
    if (!albums[k]) albums[k] = { grad: s.grad, emoji: s.emoji, items: [] };
    albums[k].items.push({ s, i });
  });

  if (!Object.keys(albums).length) {
    list.appendChild(emptyState('💿', 'Sin álbumes', 'Agrega el campo album a tus canciones'));
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'album-grid';

  Object.entries(albums).forEach(([name, data]) => {
    const card = document.createElement('div');
    card.className = 'album-card';
    card.innerHTML = `
      <div class="album-art" style="background:${data.grad || 'var(--surface2)'}">
        <span style="font-size:44px">${data.emoji || '💿'}</span>
      </div>
      <div class="album-card-info">
        <div class="album-card-name">${name}</div>
        <div class="album-card-sub">${data.items[0]?.s.artist || '<unknown>'} · ${data.items.length} ${data.items.length === 1 ? 'canción' : 'canciones'}</div>
      </div>`;
    card.onclick = () => openAlbumDetail(name, data);
    grid.appendChild(card);
  });

  list.appendChild(grid);
}

function openAlbumDetail(name, data) {
  const list = $('songList');
  list.style.padding = '';
  list.innerHTML = '';

  const backRow = document.createElement('div');
  backRow.className = 'back-row';
  backRow.innerHTML = `
    <button onclick="renderCurrentTab()">‹ Álbumes</button>
    <span>${name}</span>`;
  list.appendChild(backRow);

  data.items.forEach(({ s, i }) => {
    const isActive = i === cur;
    const item = document.createElement('div');
    item.className = 'song-item' + (isActive ? ' active' : '');
    const thumb = s.cover
      ? `<div class="song-thumb"><img src="${s.cover}" alt=""/></div>`
      : `<div class="song-thumb" style="background:${s.grad || 'var(--surface2)'}"><span>${s.emoji || '♪'}</span></div>`;
    const eq = (isActive && playing)
      ? `<div class="eq-wrap"><div class="eq-b"></div><div class="eq-b"></div><div class="eq-b"></div></div>` : '';
    item.innerHTML = `
      ${thumb}
      <div class="song-item-info">
        <div class="song-item-name${isActive ? ' accent' : ''}">${s.title}</div>
        <div class="song-item-sub">${s.artist || '<unknown>'}</div>
      </div>
      <div class="song-item-right">${eq}<button class="song-more" onclick="event.stopPropagation()">⋮</button></div>`;
    item.onclick = () => { loadSong(i); playing = false; togglePlay(); openPlayer(); };
    list.appendChild(item);
  });
}

/* ─── CARPETAS ───────────────────────────── */
function renderCarpetas(list) {
  const folders = {};
  songs.forEach((s, i) => {
    const k = s.folder || s.src?.split('/').slice(0,-1).join('/') || 'raíz';
    if (!folders[k]) folders[k] = [];
    folders[k].push({ s, i });
  });

  if (!Object.keys(folders).length) {
    list.appendChild(emptyState('📁', 'Sin carpetas', 'Agrega el campo folder a tus canciones'));
    return;
  }

  Object.entries(folders).forEach(([name, items]) => {
    const item = document.createElement('div');
    item.className = 'song-item';
    item.innerHTML = `
      <div class="song-thumb" style="background:linear-gradient(135deg,#2a3fa088,#9b3fcf44)">📁</div>
      <div class="song-item-info">
        <div class="song-item-name">${name}</div>
        <div class="song-item-sub">${items.length} ${items.length === 1 ? 'canción' : 'canciones'}</div>
      </div>
      <div class="song-item-right">
        <span style="font-size:18px;color:rgba(255,255,255,.35)">›</span>
      </div>`;
    item.onclick = () => openFolderDetail(name, items);
    list.appendChild(item);
  });
}

function openFolderDetail(name, items) {
  const list = $('songList');
  list.innerHTML = '';
  const backRow = document.createElement('div');
  backRow.className = 'back-row';
  backRow.innerHTML = `
    <button onclick="renderCurrentTab()">‹ Carpetas</button>
    <span>📁 ${name}</span>`;
  list.appendChild(backRow);

  items.forEach(({ s, i }) => {
    const isActive = i === cur;
    const item = document.createElement('div');
    item.className = 'song-item' + (isActive ? ' active' : '');
    const thumb = s.cover
      ? `<div class="song-thumb"><img src="${s.cover}" alt=""/></div>`
      : `<div class="song-thumb" style="background:${s.grad || 'var(--surface2)'}"><span>${s.emoji || '♪'}</span></div>`;
    const eq = (isActive && playing)
      ? `<div class="eq-wrap"><div class="eq-b"></div><div class="eq-b"></div><div class="eq-b"></div></div>` : '';
    item.innerHTML = `
      ${thumb}
      <div class="song-item-info">
        <div class="song-item-name${isActive ? ' accent' : ''}">${s.title}</div>
        <div class="song-item-sub">${s.artist || '<unknown>'}</div>
      </div>
      <div class="song-item-right">${eq}<button class="song-more" onclick="event.stopPropagation()">⋮</button></div>`;
    item.onclick = () => { loadSong(i); playing = false; togglePlay(); openPlayer(); };
    list.appendChild(item);
  });
}

/* ─── COLA DE REPRODUCCIÓN ───────────────── */
function renderQueue() {
  const container = $('queueList');
  if (!container) return;
  container.innerHTML = '';
  const start = (cur + 1) % songs.length;
  const max   = Math.min(songs.length - 1, 8);
  for (let x = 0; x < max; x++) {
    const i = (start + x) % songs.length;
    const s = songs[i];
    const item = document.createElement('div');
    item.className = 'queue-item';
    const thumb = s.cover
      ? `<div class="queue-thumb"><img src="${s.cover}" alt=""/></div>`
      : `<div class="queue-thumb" style="background:${s.grad || 'rgba(255,255,255,.1)'}"><span style="font-size:14px">${s.emoji || '♪'}</span></div>`;
    item.innerHTML = `
      ${thumb}
      <div class="queue-info">
        <div class="queue-name">${s.title}</div>
        <div class="queue-artist">${s.artist || '<unknown>'}</div>
      </div>`;
    item.onclick = () => { loadSong(i); if (!playing) togglePlay(); };
    container.appendChild(item);
  }
}

/* ─── HELPER EMPTY STATE ─────────────────── */
function emptyState(emoji, title, sub, actionLabel, actionFn) {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.innerHTML = `
    <div class="empty-emoji">${emoji}</div>
    <div class="empty-title">${title}</div>
    <div class="empty-sub">${sub}</div>
    ${actionLabel ? `<button class="empty-action-btn" onclick="${actionFn}">${actionLabel}</button>` : ''}`;
  return div;
}

/* ════════════════════════════════════════════
   VISTAS
   ════════════════════════════════════════════ */
function openPlayer() {
  $('viewList')?.classList.remove('active');
  $('viewPlayer')?.classList.add('active');
}
function closePlayer() {
  $('viewPlayer')?.classList.remove('active');
  $('viewList')?.classList.add('active');
}
function openMenu() { /* futuro: menú lateral */ }

/* ════════════════════════════════════════════
   MODALES
   ════════════════════════════════════════════ */
function openModal(id)  { $(id)?.classList.remove('hidden'); }
function closeModal(id) { $(id)?.classList.add('hidden'); }

/* ════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════ */
let toastTimer = null;
function showToast(msg) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.remove('hidden');
  requestAnimationFrame(() => t.classList.add('show'));
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.classList.add('hidden'), 260);
  }, 2200);
}

/* ════════════════════════════════════════════
   SERVICE WORKER
   ════════════════════════════════════════════ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW:', e));
  });
}

/* ════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════ */
(function init() {
  sortedSongs = [...songs];
  renderCurrentTab();
  renderQueue();
  if (songs.length) loadSong(0);
})();