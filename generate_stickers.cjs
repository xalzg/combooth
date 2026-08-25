const fs = require('fs');
const path = require('path');

const stickers = [
  { id: 'crown', emoji: '👑' },
  { id: 'cowboy_hat', emoji: '🤠' },
  { id: 'detective_hat', emoji: '🕵️' },
  { id: 'clown_glasses', emoji: '🤡' },
  { id: 'black_glasses', emoji: '🕶️' },
  { id: 'cat_whiskers', emoji: '🐱' },
  { id: 'bunny_ears', emoji: '🐰' },
  { id: 'bow_arrow', emoji: '🏹' },
  { id: 'hi_bubble', emoji: '💬' },
  { id: 'exclamation', emoji: '❗' },
  { id: 'time_box', emoji: '⏳' },
  { id: 'date_box', emoji: '📅' },
  { id: 'confetti', emoji: '🎉' },
];

const dir = path.join(__dirname, 'client', 'public', 'stickers');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

stickers.forEach(s => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="300" height="300">
  <text x="50" y="50" font-size="80" text-anchor="middle" dominant-baseline="central">${s.emoji}</text>
</svg>`;
  fs.writeFileSync(path.join(dir, `${s.id}.svg`), svg);
});
console.log('Stickers generated!');
