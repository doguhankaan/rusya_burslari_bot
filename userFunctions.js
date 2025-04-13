const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const language = require('./language');
const fs = require('fs');
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',  
  user: 'root',       
  password: '',
  database: 'rusya_burslari', 
  waitForConnections: true,
  connectionLimit: 10,  
  queueLimit: 0
});

const userSteps = {};
const userSelectedLanguage = {};
const userLastAnnouncment = {};

const topics = {}
const supportChatID = -1002395229320

function askLanguage(ctx) {
  userSteps[ctx.from.id] = 'askLanguage';
  ctx.reply('👸🏼 Люда: Пожалуйста, выберите язык, на котором вам удобно общаться:\n\n👸🏼 Luda: Lütfen iletişim kurmak istediğiniz dili seçiniz:', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🇷🇺 Русский', callback_data: 'select_language_ru' },
          { text: '🇹🇷 Türkçe', callback_data: 'select_language_tr' },
        ],
      ],
    },
  });
}

function setUserLanguage(ctx, lang){
  userSelectedLanguage[ctx.from.id] = lang;
}

function getUserLanguage(ctx){
  return userSelectedLanguage[ctx.from.id];
}


function getLocalizedMessageByUserID(ctx, messageKey, userID) {
  var userLanguage = userSelectedLanguage[userID]; 

  if (userLanguage === undefined) {
    userLanguage = (ctx.from.language_code != "ru" && ctx.from.language_code != "tr") ? "tr" : ctx.from.language_code;
  }

  return language.messages[messageKey][userLanguage];
}


function getLocalizedMessage(ctx, messageKey) {
  var userLanguage = userSelectedLanguage[ctx.from.id]; 
  if (userLanguage === undefined) {
    userLanguage = (ctx.from.language_code != "ru" && ctx.from.language_code != "tr") ? "tr" : ctx.from.language_code;
  }

  return language.messages[messageKey][userLanguage];
}

async function checkSubscription(ctx) {
  userSteps[ctx.from.id] = 'Abonelik';
  const channelUsername = '@test_ankara'; 

  try {
    const chatMember = await ctx.telegram.getChatMember(channelUsername, ctx.from.id);

    if (['member', 'administrator', 'creator'].includes(chatMember.status)) {
      return userMainMenu(ctx); 
    }
  } catch (error) {
    console.log('Hata:', error);
  }

return ctx.reply(getLocalizedMessage(ctx, "subscribeInvitation"), {
  reply_markup: {
    inline_keyboard: [
      [{ text: getLocalizedMessage(ctx, "subscribePrompt"), url: `https://t.me/${channelUsername.replace('@', '')}` }],
      [{ text: getLocalizedMessage(ctx, "subscribeSuccess"), callback_data: 'check_subscription' }],
    ]
  }
});
}

function userMainMenu(ctx) {
  userSteps[ctx.from.id] = 'AnaMenu';
  const userLanguage = userSelectedLanguage[ctx.from.id] || 'tr'; 
  const urls = getUrls()[userLanguage];
  ctx.reply(getLocalizedMessage(ctx, "welcomeMessage"), {
    reply_markup: {
      inline_keyboard: [
        [{ text: getLocalizedMessage(ctx, "scholarshipCandidate"), callback_data: 'bursiyer_adayi' }],
        [{ text: getLocalizedMessage(ctx, "scholarshipHolder"), callback_data: 'bursiyer' }],
        [
          { text: getLocalizedMessage(ctx, "support"), callback_data: 'destek' },
          { text: getLocalizedMessage(ctx, "feedback"), url: urls.feedback}
        ],
        [{ text: getLocalizedMessage(ctx, "change_language_dynamic"), callback_data: 'cld' }],
      ],
    },
  });
}

function bursiyerAdayiMenu(ctx) {
  userSteps[ctx.from.id] = 'bursiyerAdayi';
  const userLanguage = userSelectedLanguage[ctx.from.id] || 'tr'; 
  const urls = getUrls()[userLanguage];
  ctx.reply(getLocalizedMessage(ctx, "scholarshipApplicantMenu"), {
    reply_markup: {
      inline_keyboard: [
        [{ text: getLocalizedMessage(ctx, "scholarshipApplicant0"), callback_data: 'rosScholarshipApplicantMenu' }],
        [{ text: getLocalizedMessage(ctx, "scholarshipApplicant1"), callback_data: 'basvuru_proseduru' }],
        [{ text: getLocalizedMessage(ctx, "scholarshipApplicant2"), url: urls.scholarshipApplicant2 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipApplicant3"), url: urls.scholarshipApplicant3 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipApplicant4"), url: urls.scholarshipApplicant4 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipApplicant5"), url: urls.scholarshipApplicant5 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipApplicant6"), url: urls.scholarshipApplicant6 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipApplicant7"), url: urls.scholarshipApplicant7 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipApplicant8"), url: urls.scholarshipApplicant8 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipApplicant9"), url: urls.scholarshipApplicant9 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipApplicant10"), url: urls.scholarshipApplicant10 }],
        [{ text: getLocalizedMessage(ctx, "ana_menu_button"), callback_data: 'ana_menu' }],
      ],
    },
  });
}

function rosScholarshipApplicantMenu(ctx) {
  userSteps[ctx.from.id] = 'rosScholarshipApplicantMenu';
  const userLanguage = userSelectedLanguage[ctx.from.id] || 'tr';
  const urls = getUrls()[userLanguage];
ctx.replyWithPhoto({source:__dirname + "/documents_data/AkkuyuBurslari.png"},{
  caption: getLocalizedMessage(ctx, "rosScholarshipApplicantMenu"),
  reply_markup: {
    remove_keyboard: true,
    inline_keyboard: [
      [{ text: getLocalizedMessage(ctx, "rosScholarshipApplicant1"), url: urls.rosScholarshipApplicant1 }],
      [{ text: getLocalizedMessage(ctx, "rosScholarshipApplicant2"), url: urls.rosScholarshipApplicant2 }],
      [{ text: getLocalizedMessage(ctx, "geri_button"), callback_data: 'bursiyer_adayi' }],
    ],
  },
});
}

function basvuru_proseduru(ctx){
  userSteps[ctx.from.id] = 'scholarshipApplicant1';
 const userLanguage = userSelectedLanguage[ctx.from.id] || 'tr';
 const documentPath = userLanguage === 'tr' 
   ? "/documents_data/Başvuru Prosedürü.pdf" 
   : "/documents_data/Protsedura podachi zaiavki.pdf";

 ctx.replyWithDocument({ source: __dirname + documentPath }, {
   caption: getLocalizedMessage(ctx, "applicationProcedure"),
   reply_markup: {
     remove_keyboard: true,
     inline_keyboard: [
       [{ text: getLocalizedMessage(ctx, "geri_button"), callback_data: 'bursiyer_adayi' }],
     ],
   },
 });
}


function bursiyerMenu(ctx) {
  userSteps[ctx.from.id] = 'bursiyer';
  const userLanguage = userSelectedLanguage[ctx.from.id] || 'tr'; 
  const urls = getUrls()[userLanguage];
  ctx.reply(getLocalizedMessage(ctx, "scholarshipRecipientMenu"), {
    reply_markup: {
      inline_keyboard: [
        [{ text: getLocalizedMessage(ctx, "scholarshipRecipient1"), url: urls.scholarshipRecipient1 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipRecipient2"), url: urls.scholarshipRecipient2 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipRecipient3"), url: urls.scholarshipRecipient3 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipRecipient4"), url: urls.scholarshipRecipient4 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipRecipient5"), url: urls.scholarshipRecipient5 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipRecipient6"), url: urls.scholarshipRecipient6 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipRecipient7"), url: urls.scholarshipRecipient7 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipRecipient8"), url: urls.scholarshipRecipient8 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipRecipient9"), url: urls.scholarshipRecipient9 }],
        [{ text: getLocalizedMessage(ctx, "scholarshipRecipient10"), url: urls.scholarshipRecipient10 }],
        [{ text: getLocalizedMessage(ctx, "ana_menu_button"), callback_data: 'ana_menu' }],
      ],
    },
  });
}

function getUrls() {
  return {
    tr: {
      feedback: 'https://forms.yandex.com/u/6751a3489029021b9d452ec8/',

      rosScholarshipApplicant1: 'https://telegra.ph/Rosatom-Burslar%C4%B1-11-25',
      rosScholarshipApplicant2: 'https://telegra.ph/Ba%C5%9Fvuru-k%C4%B1lavuzu-11-25',

      scholarshipApplicant2: 'https://telegra.ph/Y%C3%BCksek%C3%B6%C4%9Frenim-bursu-ve-kapsam%C4%B1-10-03',
      scholarshipApplicant3: 'https://telegra.ph/Burslar%C4%B1n-verildi%C4%9Fi-seviyeler-ve-programlar-10-03',
      scholarshipApplicant4: 'https://telegra.ph/E%C4%9Fitim-diline-dair-bilgi-10-03',
      scholarshipApplicant5: 'https://telegra.ph/%C3%9Cniversiteler-10-03',
      scholarshipApplicant6: 'https://telegra.ph/S%C4%B1k%C3%A7a-Sorulan-Sorular-SSS-10-03',
      scholarshipApplicant7: 'https://telegra.ph/1Etap-burs-ba%C5%9Fvurusu-i%C3%A7in-adaylar%C4%B1n-haz%C4%B1rlamas%C4%B1-gereken-belgelerin-listesi-10-03',
      scholarshipApplicant8: 'https://telegra.ph/Talimatname-09-12',
      scholarshipApplicant9: 'https://telegra.ph/M%C3%BClakat-Takvimi-01-08',
      scholarshipApplicant10: 'https://telegra.ph/Adaylar-Aras%C4%B1ndan-Se%C3%A7ilenler-01-20',

      scholarshipRecipient1: 'https://telegra.ph/2Etap-Talimatname-01-20',
      scholarshipRecipient2: 'https://telegra.ph/2Etap-Talimatname-01-20',
      scholarshipRecipient3: 'https://telegra.ph/Burs-feragat-dilek%C3%A7esi-10-08',
      scholarshipRecipient4: 'https://telegra.ph/Vize-S%C3%BCre%C3%A7leri-10-06',
      scholarshipRecipient5: 'https://telegra.ph/Haz%C4%B1rl%C4%B1k-Fak%C3%BCltesi-10-06',
      scholarshipRecipient6: 'https://telegra.ph/%C3%9Cniversite-De%C4%9Fi%C5%9Fikli%C4%9Fi-10-05',
      scholarshipRecipient7: 'https://telegra.ph/B%C3%B6l%C3%BCm-De%C4%9Fi%C5%9Fikli%C4%9Fi-10-06',
      scholarshipRecipient8: 'https://telegra.ph/%C3%96%C4%9Frenci-Dosyas%C4%B1-10-06',
      scholarshipRecipient9: 'https://telegra.ph/Askerlik-Tecil-10-06',
      scholarshipRecipient10: 'https://telegra.ph/%C3%96%C4%9Frenci-toplulu%C4%9Fu-10-08',
    },
    ru: {
      feedback: 'https://forms.yandex.com/u/6751a3489029021b9d452ec8/',

      rosScholarshipApplicant1: 'https://telegra.ph/Stipendii-Rosatoma-11-26',
      rosScholarshipApplicant2: 'https://telegra.ph/Ba%C5%9Fvuru-k%C4%B1lavuzu-11-25',

      scholarshipApplicant2: 'https://telegra.ph/Stipendiya-na-vysshee-obrazovanie-i-eyo-usloviya-10-03',
      scholarshipApplicant3: 'https://telegra.ph/Urovni-obrazovaniya-i-programmy-na-kotorye-predostavlyayutsya-stipendii-10-03',
      scholarshipApplicant4: 'https://telegra.ph/Informaciya-o-yazyke-obucheniya-10-03',
      scholarshipApplicant5: 'https://telegra.ph/Universitety-10-03',
      scholarshipApplicant6: 'https://telegra.ph/CHasto-zadavaemye-voprosy-FAQ-10-03',
      scholarshipApplicant7: 'https://telegra.ph/1-EHtap-Spisok-dokumentov-dlya-podachi-zayavki-10-03',
      scholarshipApplicant8: 'https://telegra.ph/1-ehtap--instrukciya-10-06',
      scholarshipApplicant9: 'https://telegra.ph/M%C3%BClakat-Takvimi-01-08',
      scholarshipApplicant10: 'https://telegra.ph/Adaylar-Aras%C4%B1ndan-Se%C3%A7ilenler-01-20',

      scholarshipRecipient1: 'https://telegra.ph/2Etap-Talimatname-01-20',
      scholarshipRecipient2: 'https://telegra.ph/2Etap-Talimatname-01-20',
      scholarshipRecipient3: 'https://telegra.ph/Hochu-otkazatsya-ot-stipendii-10-08',
      scholarshipRecipient4: 'https://telegra.ph/Poluchenie-Vizy-10-06',
      scholarshipRecipient5: 'https://telegra.ph/Podgotovitelnyj-fakultet-10-06',
      scholarshipRecipient6: 'https://telegra.ph/Smena-universiteta-10-06',
      scholarshipRecipient7: 'https://telegra.ph/Smena-specialnosti-10-06',
      scholarshipRecipient8: 'https://telegra.ph/Studencheskij-fajl-10-06',
      scholarshipRecipient9: 'https://telegra.ph/Otsrochka-ot-armii-10-06',
      scholarshipRecipient10: 'https://telegra.ph/Soobshchestvo-studencheskoe-10-08',
    }
  };
}

function announcmentSequence(ctx) {
  userSteps[ctx.from.id] = "DuyuruMetniBekleniyor";
  ctx.reply("🇷🇺 Русский дом в Анкаре:\n\nВведите текст объявления 📢", {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Отменить ❌', callback_data: 'announcment_cancel' }],
      ],
    },
  });
}

function announcmentConfirmation(ctx, message) {
  userLastAnnouncment[ctx.from.id] = message;
  var confirmationText = "🇷🇺 Русский дом в Анкаре:\n\nВаш текст объявления 📢\n\n" + message + "\n\nВы подтверждаете? ✅";
  ctx.reply(confirmationText, {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Я подтверждаю ✅', callback_data: 'announcment_confirm' }],
        [{ text: 'Введите снова 🔄', callback_data: 'announcment_again' }],
        [{ text: 'Отменить ❌', callback_data: 'announcment_cancel' }],
      ],
    },
  });
}

function supportFunction(ctx) {
  userSteps[ctx.from.id] = 'supportQuestion';
  ctx.reply(getLocalizedMessage(ctx, "supportMessage"), {
    reply_markup: {
      inline_keyboard: [
        [{ text: getLocalizedMessage(ctx, "ana_menu_button"), callback_data: 'ana_menu' }] // Ana Menü butonu
      ],
    },
  });
}

// VERİTABANI
function runQuery(sql, params) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

async function addUserIfNotExists(telegramId, telegramUsername) {
  try {
    // 1. Veritabanında Telegram ID'si olup olmadığını kontrol et
    const existingUser = await runQuery('SELECT * FROM users WHERE TGID = ?', [telegramId]);
    // 2. Eğer kullanıcı varsa, ekleme yapma
    if (existingUser.length > 0) {
      console.log('Kullanıcı zaten mevcut:', existingUser[0]);
      return existingUser[0];  // Mevcut kullanıcıyı döndür
    }
    if (telegramUsername === null || telegramUsername === undefined) {
      telegramUsername = "";
    }
    // 3. Eğer kullanıcı yoksa, yeni kullanıcıyı ekle
    const result = await runQuery(
      'INSERT INTO users (TGID, USERNAME) VALUES (?, ?)',
      [telegramId, telegramUsername]
    );
    console.log('Yeni kullanıcı eklendi:', { telegramId, telegramUsername });
    return result;
  } catch (error) {
    console.error('Kullanıcı eklenirken bir hata oluştu:', error);
  }
}

async function getAllTelegramIds() {
  try {
    // Veritabanındaki tüm telegram_id'leri seç
    const results = await runQuery('SELECT TGID FROM users');
    // Sonuçları array formatına çevir
    const telegramIds = results.map(row => row.TGID);
    return telegramIds;  // Telegram ID'leri döndür
  } catch (error) {
    console.error('Kullanıcıların Telegram ID\'leri alınırken bir hata oluştu:', error);
  }
}

async function getAllAdminTelegramIds() {
  try {
    // Veritabanındaki tüm telegram_id'leri seç
    const results = await runQuery('SELECT TGID FROM admins');
    // Sonuçları array formatına çevir
    const telegramIds = results.map(row => row.TGID);
    return telegramIds;  // Telegram ID'leri döndür
  } catch (error) {
    console.error('Kullanıcıların Telegram ID\'leri alınırken bir hata oluştu:', error);
  }
}

async function addTopic(userID, topicTitle, topicID){
  const result = await runQuery(
    "INSERT INTO topics (UserID, TopicTitle, TopicID) VALUES (?, ?, ?)",
    [userID, topicTitle, topicID]
  );
}

async function getTopic(userID){
  const result = await runQuery(
    "SELECT * FROM topics WHERE UserID = ?",
    [userID]
  );

  return result;
}

async function getUserByTopicID(topicID) {
  const result = await runQuery(
    "SELECT * FROM topics WHERE TopicID = ?",
    [topicID]
  );

  return result[0];
}

async function sendQuestionToSupportTopic(ctx, message){
  if (ctx.chat.id === supportChatID) return;
  let userID = ctx.from.id;
  let users = await getTopic(userID);

  try {
    if(users.length == 0){
      const topicTitle = (ctx.from.username || "Bursiyer Adayı") + " - " + userID.toString();
      const topic = await ctx.telegram.createForumTopic(supportChatID, topicTitle);
      const topicID = topic.message_thread_id;
      await addTopic(userID, topicTitle, topicID);
    }

    let currentTopic = await getTopic(userID);
    currentTopic = currentTopic[0].TopicID;

    let messageText = message.text;
    let messageCaption = message.caption;

    if (message.text) {
        await ctx.telegram.sendMessage(supportChatID, messageText, {
          message_thread_id: currentTopic,
        });
    } else if (message.photo) {
        const photo = message.photo[message.photo.length - 1]; // En büyük çözünürlükteki fotoğrafı al
        await ctx.telegram.sendPhoto(supportChatID, photo.file_id, { caption: messageCaption, message_thread_id: currentTopic });
    } else if (message.video) {
        await ctx.telegram.sendVideo(supportChatID, message.video.file_id, { caption: messageCaption, message_thread_id: currentTopic });
    } else if (message.document) {
        await ctx.telegram.sendDocument(supportChatID, message.document.file_id, { caption: messageCaption, message_thread_id: currentTopic });
    } else if (message.audio) {
        await ctx.telegram.sendAudio(supportChatID, message.audio.file_id, { caption: messageCaption, message_thread_id: currentTopic });
    } else if (message.voice) {
        await ctx.telegram.sendVoice(supportChatID, message.voice.file_id, { message_thread_id: currentTopic });
    } else if (message.sticker) {
        await ctx.telegram.sendSticker(supportChatID, message.sticker.file_id, { message_thread_id: currentTopic });
    } else if (message.video_note) {
        await ctx.telegram.sendVideoNote(supportChatID, message.video_note.file_id, { message_thread_id: currentTopic });
    } else if (message.location) {
        await ctx.telegram.sendLocation(supportChatID, message.location.latitude, message.location.longitude, { message_thread_id: currentTopic });
    } else if (message.contact) {
        await ctx.telegram.sendContact(supportChatID, message.contact.phone_number, message.contact.first_name, { last_name: message.contact.last_name, message_thread_id: currentTopic });
    } else {
        await ctx.reply(getLocalizedMessage(ctx, "invalidFile"));
    }

  } catch (error) {
    console.error('Konu oluşturulamadı:', error);
    ctx.reply(getLocalizedMessage(ctx, "exceptionWhileCreatingTopic"));
  }
}

async function checkAdminReply(ctx) {
  if (ctx.chat.id === supportChatID && ctx.message.message_thread_id) {
    const topicId = ctx.message.message_thread_id;

    const valueToFind = topicId;
    let keyFound = null;

    keyFound = await getUserByTopicID(topicId);
    keyFound = keyFound.UserID;

    if(keyFound){
      const message = ctx.message;
      let messageText = message.text;
      let messageCaption = message.caption;

      if(!messageText) messageText = "";
      if(!messageCaption) messageCaption = "";

      messageText = getLocalizedMessageByUserID(ctx, "russianHouseName", keyFound) + " " + messageText + "\n" + getLocalizedMessageByUserID(ctx, "anythingElse", keyFound);
      messageCaption = getLocalizedMessageByUserID(ctx, "russianHouseName", keyFound) + " " + messageCaption + "\n" + getLocalizedMessageByUserID(ctx, "anythingElse", keyFound);;

      if (message.text) {
        await ctx.telegram.sendMessage(keyFound, messageText);
      } else if (message.photo) {
          const photo = message.photo[message.photo.length - 1]; // En büyük çözünürlükteki fotoğrafı al
          await ctx.telegram.sendPhoto(keyFound, photo.file_id, { caption: messageCaption});
      } else if (message.video) {
          await ctx.telegram.sendVideo(keyFound, message.video.file_id, { caption: messageCaption });
      } else if (message.document) {
          await ctx.telegram.sendDocument(keyFound, message.document.file_id, { caption: messageCaption });
      } else if (message.audio) {
          await ctx.telegram.sendAudio(keyFound, message.audio.file_id, { caption: messageCaption });
      } else if (message.voice) {
          await ctx.telegram.sendVoice(keyFound, message.voice.file_id);
      } else if (message.sticker) {
          await ctx.telegram.sendSticker(keyFound, message.sticker.file_id);
      } else if (message.video_note) {
          await ctx.telegram.sendVideoNote(keyFound, message.video_note.file_id );
      } else if (message.location) {
          await ctx.telegram.sendLocation(keyFound, message.location.latitude, message.location.longitude);
      } else if (message.contact) {
          await ctx.telegram.sendContact(keyFound, message.contact.phone_number, message.contact.first_name, { last_name: message.contact.last_name });
      } else {
          await ctx.reply(getLocalizedMessage(ctx, "invalidFile"));
      }
    }
  }
}

async function blockUnwantedContent(ctx) {
  if (ctx.chat.id === supportChatID) return;
  const currentStep = userSteps[ctx.from.id]; 
  if (currentStep === 'DuyuruMetniBekleniyor') {
    announcmentConfirmation(ctx, ctx.message.text);
    return;
  }

  if(currentStep === 'supportQuestion'){
    await sendQuestionToSupportTopic(ctx, ctx.message);
    ctx.reply(getLocalizedMessage(ctx, "gotQuestion"));
    return;
  }


  const message = getLocalizedMessage(ctx, "contentNotAllowed");
  ctx.deleteMessage().catch(function() {console.log("error")});
  const sentMessage = await ctx.reply(message);
  setTimeout(() => {
    ctx.deleteMessage(sentMessage.message_id).catch(function(){console.log("Engellenen içerik gönderildi.")});
  }, 3000);
}

module.exports = {
  axios,
  fs,
  announcmentSequence,
  blockUnwantedContent,
  checkSubscription,
  language,
  askLanguage,
  getLocalizedMessage,
  setUserLanguage,
  userSteps,
  userLastAnnouncment,
  userMainMenu,
  bursiyerAdayiMenu,
  rosScholarshipApplicantMenu,
  bursiyerMenu,
  basvuru_proseduru,
  addUserIfNotExists,
  getAllTelegramIds,
  getAllAdminTelegramIds,
  getUserLanguage,
  supportFunction,
  checkAdminReply
};
