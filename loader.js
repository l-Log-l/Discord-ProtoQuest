// ProtoQuest Loader - Короткий скрипт для загрузки основного скрипта
// Вставьте этот код в консоль Discord (F12 -> Console)

fetch('https://raw.githubusercontent.com/l-Log-l/Discord-ProtoQuest/main/quest.js')
  .then(r => r.text())
  .then(eval)
  .catch(e => console.error('ProtoQuest: Failed to load', e));