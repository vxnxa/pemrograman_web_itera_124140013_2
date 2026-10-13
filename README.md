# Student Hub ITERA

## Deskripsi
Personal dashboard untuk mahasiswa yang menampilkan cuaca kampus ITERA,
kutipan motivasi harian, dan manajemen tugas kuliah (tambah, edit, hapus,
tandai selesai, filter). Data tugas disimpan di localStorage.

## Fitur
- Tambah, edit, hapus, dan tandai selesai tugas
- Filter tugas (semua / belum selesai / selesai)
- Widget cuaca real-time (Open-Meteo)
- Kutipan harian (DummyJSON)
- Data awal tugas dari JSONPlaceholder
- Jam digital & sapaan otomatis
- Responsive design

## Screenshot
![Screenshot](screenshot.png)

## Fitur ES6+ yang Diimplementasikan
| Fitur | Lokasi (script.js) |
|-------|--------------------|
| `let` & `const` | Seluruh file (mis. `const API`, `let` pada `this.filter`) — baris XX |
| Arrow functions (`escapeHTML`, `formatDate`, `describeWeather`, dll.) | baris XX–XX |
| Template literals | `toHTML()`, `fetchWeather()`, `render()` — baris XX |
| Async/Await | `init()`, `fetchJSON()`, `seedTasks()`, `fetchWeather()`, `fetchQuote()` — baris XX |
| Classes | `TaskItem` (baris XX), `DashboardApp` (baris XX) |
| Destructuring | `constructor` TaskItem, `fetchWeather()`, event submit — baris XX |
| Spread operator | `TaskItem.with()`, `addTask()` — baris XX |
| Optional chaining & nullish coalescing | `actions[action]?.()`, `?? []` — baris XX |
| Promise.allSettled | `init()` — baris XX |

## Cara Menjalankan
Buka `index.html` di browser (atau pakai Live Server di VS Code).