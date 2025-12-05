// ProtoQuest Loader - Короткий скрипт для загрузки основного скрипта
// Вставьте этот код в консоль Discord (F12 -> Console)

// Вариант 1: Загрузка с GitHub (замените URL на свой)
fetch('https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/quest.js')
  .then(r => r.text())
  .then(eval)
  .catch(e => console.error('ProtoQuest: Failed to load', e));

// Вариант 2: Загрузка с GitHub Gist
// fetch('https://gist.githubusercontent.com/YOUR_USERNAME/GIST_ID/raw/quest.js')
//   .then(r => r.text())
//   .then(eval)
//   .catch(e => console.error('ProtoQuest: Failed to load', e));

// Вариант 3: Загрузка с любого хостинга (pastebin, etc)
// fetch('https://your-hosting.com/quest.js')
//   .then(r => r.text())
//   .then(eval)
//   .catch(e => console.error('ProtoQuest: Failed to load', e));