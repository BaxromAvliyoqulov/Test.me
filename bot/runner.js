/**
 * Test.me Telegram Support Bot - Local Polling Runner
 * 
 * Ushbu skript botni lokal yoki serverda mustaqil ishga tushirish uchun xizmat qiladi.
 * Ishga tushirish: node bot/runner.js
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// .env yoki functions/.env faylidan o'qish
if (fs.existsSync('./functions/.env')) {
  dotenv.config({ path: './functions/.env' });
} else {
  dotenv.config();
}

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '587788509';

if (!BOT_TOKEN) {
  console.error("❌ Xatolik: TELEGRAM_BOT_TOKEN topilmadi! Iltimos, .env yoki functions/.env faylida ko'rsating.");
  process.exit(1);
}

let lastUpdateId = 0;

function escapeTgHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendTelegramMessage(chatId, text, replyMarkup = null) {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    };
    if (replyMarkup) payload.reply_markup = replyMarkup;

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  } catch (err) {
    console.error('SendMessage error:', err.message);
  }
}

async function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  const fromUser = msg.from || {};
  const userName = [fromUser.first_name, fromUser.last_name].filter(Boolean).join(' ') || fromUser.username || 'Foydalanuvchi';

  console.log(`[Message from ${userName} (${chatId})]: ${text}`);

  if (text.startsWith('/start')) {
    const welcome = 
      `👋 <b>Assalomu alaykum, ${escapeTgHtml(userName)}!</b>\n\n` +
      `🎯 <b>Test.me</b> platformasining rasmiy qo'llab-quvvatlash botiga xush kelibsiz.\n\n` +
      `Siz bu yerda o'z savollaringiz, takliflaringiz yoki platformadagi texnik muammolar bo'yicha murojaat qilishingiz mumkin.\n\n` +
      `✍️ <i>Murojaatingizni ushbu chatga yozib qoldiring. Administratorlarimiz tez orada siz bilan bog'lanishadi!</i>`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '🌐 Test.me saytiga o\'tish', url: 'https://test-me.uz' }],
        [{ text: '👨‍💻 Dasturchi bilan bog\'lanish', url: 'https://t.me/Baxrom_Dev' }]
      ]
    };
    await sendTelegramMessage(chatId, welcome, keyboard);
    return;
  }

  if (text.startsWith('/support')) {
    await sendTelegramMessage(
      chatId,
      `📞 <b>Qo'llab-quvvatlash xizmati:</b>\n\n` +
      `👤 Dasturchi: @Baxrom_Dev\n` +
      `📱 Tel: +998 99 074 62 57\n` +
      `📧 Email: avliyoqulovbaxrom99@gmail.com`
    );
    return;
  }

  if (text.startsWith('/website')) {
    await sendTelegramMessage(chatId, '🌐 <b>Test.me</b> platformasiga havola: https://test-me.uz');
    return;
  }

  // Foydalanuvchiga tasdiq xabari
  await sendTelegramMessage(
    chatId,
    `✅ <b>Xabaringiz qabul qilindi!</b>\n\nTez orada administratorlarimiz siz bilan bog'lanishadi. Rahmat!`
  );

  // Adminga xabarnoma jo'natish
  if (String(chatId) !== String(ADMIN_CHAT_ID)) {
    const adminNotif = 
      `📩 <b>BOT ORQALI YANGI XABAR!</b>\n\n` +
      `👤 <b>Foydalanuvchi:</b> ${escapeTgHtml(userName)} (<code>${chatId}</code>)\n` +
      `🔗 <b>Username:</b> ${fromUser.username ? '@' + escapeTgHtml(fromUser.username) : 'Yo\'q'}\n` +
      `💬 <b>Xabar:</b>\n<i>${escapeTgHtml(text)}</i>\n\n` +
      `🕒 <i>Vaqt: ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}</i>`;

    await sendTelegramMessage(ADMIN_CHAT_ID, adminNotif);
  }
}

async function poll() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
    const data = await res.json();

    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        if (update.message) {
          await handleMessage(update.message);
        }
      }
    }
  } catch (err) {
    console.error('Polling error:', err.message);
    await new Promise(r => setTimeout(r, 3000));
  }

  setImmediate(poll);
}

async function start() {
  console.log('🤖 Test.me Bot ishga tushmoqda...');
  const me = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`).then(r => r.json());
  if (!me.ok) {
    console.error('Bot token xato:', me);
    process.exit(1);
  }
  console.log(`✅ Bot tayyor: @${me.result.username} (${me.result.first_name})`);
  console.log('🚀 Xabarlarni tinglash boshlandi (Polling)...');
  poll();
}

start();
