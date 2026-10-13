const STORAGE_KEY = 'RuangTugas.tasks';
const API = {
  weather: 'https://api.open-meteo.com/v1/forecast?latitude=-5.36&longitude=105.31&current_weather=true',
  quote: 'https://dummyjson.com/quotes/random',
  todos: 'https://jsonplaceholder.typicode.com/todos?_limit=5',
};

const escapeHTML = (str) =>
  String(str).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );

const formatDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Tanpa deadline';

const describeWeather = (code) => {
  if (code === 0) return '☀️ Cerah';
  if (code <= 3) return '⛅ Berawan';
  if (code <= 48) return '🌫️ Berkabut';
  if (code <= 67) return '🌧️ Hujan';
  if (code <= 82) return '🌦️ Hujan Lokal';
  return '⛈️ Badai Petir';
};

class TaskItem {
  constructor({ id = Date.now() + Math.random(), title, deadline = '', category = 'Kuliah', done = false }) {
    this.id = id;
    this.title = title;
    this.deadline = deadline;
    this.category = category;
    this.done = done;
  }

  with(changes) {
    return new TaskItem({ ...this, ...changes });
  }

  toHTML() {
    return `
      <li class="task ${this.done ? 'done' : ''}" data-id="${this.id}">
        <input type="checkbox" data-action="toggle" ${this.done ? 'checked' : ''}>
        <div class="task-info">
          <div class="task-title">${escapeHTML(this.title)}</div>
          <div class="task-meta">
            <span class="badge">${escapeHTML(this.category)}</span>
            📅 ${formatDate(this.deadline)}
          </div>
        </div>
        <button class="btn-edit" data-action="edit">Edit</button>
        <button class="btn-del" data-action="delete">Hapus</button>
      </li>`;
  }
}

class DashboardApp {
  constructor() {
    this.tasks = [];
    this.filter = 'all';

    this.el = {
      form: document.getElementById('task-form'),
      title: document.getElementById('title'),
      deadline: document.getElementById('deadline'),
      category: document.getElementById('category'),
      list: document.getElementById('task-list'),
      stats: document.getElementById('stats'),
      filter: document.getElementById('filter'),
      weather: document.getElementById('weather'),
      quote: document.getElementById('quote'),
      clock: document.getElementById('clock'),
      greeting: document.getElementById('greeting'),
    };
  }

  async init() {
    this.bindEvents();
    this.startClock();

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.loadTasks();
    } else {
      await this.seedTasks(); 
    }
    this.render();

    await Promise.allSettled([this.fetchWeather(), this.fetchQuote()]);
  }

  loadTasks() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
      this.tasks = data.map((item) => new TaskItem(item));
    } catch {
      this.tasks = [];
    }
  }

  saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
  }

  async fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async seedTasks() {
    try {
      const todos = await this.fetchJSON(API.todos);
      this.tasks = todos.map(({ title, completed }) => new TaskItem({ title, done: completed }));
    } catch (err) {
      console.warn('Gagal memuat data awal:', err);
      this.tasks = [new TaskItem({ title: 'Kerjakan tugas Pemrograman Web' })];
    }
    this.saveTasks();
  }

  async fetchWeather() {
    try {
      const { current_weather: { temperature, windspeed, weathercode } } = await this.fetchJSON(API.weather);
      this.el.weather.innerHTML = `
        <div class="temp">${temperature}°C</div>
        <div>${describeWeather(weathercode)}</div>
        <small>💨 Angin ${windspeed} km/jam • Lampung Selatan</small>`;
    } catch {
      this.el.weather.textContent = 'Gagal memuat cuaca 😢';
    }
  }

  async fetchQuote() {
    try {
      const { quote, author } = await this.fetchJSON(API.quote);
      this.el.quote.innerHTML = `“${escapeHTML(quote)}”<footer>— ${escapeHTML(author)}</footer>`;
    } catch {
      this.el.quote.textContent = 'Gagal memuat kutipan 😢';
    }
  }

  addTask(data) {
    this.tasks = [new TaskItem(data), ...this.tasks];
    this.commit();
  }

  toggleTask(id) {
    this.tasks = this.tasks.map((t) => (t.id === id ? t.with({ done: !t.done }) : t));
    this.commit();
  }

  editTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;
    const newTitle = prompt('Edit judul tugas:', task.title);
    if (newTitle && newTitle.trim()) {
      this.tasks = this.tasks.map((t) => (t.id === id ? t.with({ title: newTitle.trim() }) : t));
      this.commit();
    }
  }

  deleteTask(id) {
    if (!confirm('Hapus tugas ini?')) return;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    this.commit();
  }

  commit() {
    this.saveTasks();
    this.render();
  }

  bindEvents() {
    this.el.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const { title, deadline, category } = this.el;
      this.addTask({
        title: title.value.trim(),
        deadline: deadline.value,
        category: category.value,
      });
      this.el.form.reset();
    });

    this.el.filter.addEventListener('change', (e) => {
      this.filter = e.target.value;
      this.render();
    });

    this.el.list.addEventListener('click', (e) => {
      const { action } = e.target.dataset;
      if (!action) return;
      const id = Number(e.target.closest('.task').dataset.id);
      const actions = {
        toggle: () => this.toggleTask(id),
        edit: () => this.editTask(id),
        delete: () => this.deleteTask(id),
      };
      actions[action]?.();
    });
  }

  startClock() {
    const tick = () => {
      const now = new Date();
      const hour = now.getHours();
      let sapaan = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 18 ? 'Selamat sore' : 'Selamat malam';
      this.el.clock.textContent = now.toLocaleTimeString('id-ID');
      this.el.greeting.textContent = `${sapaan}, semangat kuliahnya! 🔥`;
    };
    tick();
    setInterval(tick, 1000);
  }

  getFilteredTasks() {
    const rules = {
      all: () => true,
      active: (t) => !t.done,
      done: (t) => t.done,
    };
    return this.tasks.filter(rules[this.filter]);
  }

  render() {
    const visible = this.getFilteredTasks();
    const total = this.tasks.length;
    const doneCount = this.tasks.filter((t) => t.done).length;

    this.el.stats.textContent = `Total: ${total} • Selesai: ${doneCount} • Tersisa: ${total - doneCount}`;
    this.el.list.innerHTML = visible.length
      ? visible.map((t) => t.toHTML()).join('')
      : '<li class="empty">Belum ada tugas. Yuk tambah satu! 🎯</li>';
  }
}

const app = new DashboardApp();
app.init();