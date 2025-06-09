const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const config = require('./config');
const userFunctions = require('./userFunctions');
const bot = new Telegraf(config.TELEGRAM_API_TOKEN);
const { blockUnwantedContent, userSteps } = require('./userFunctions'); // Fonksiyonları import et
const { type } = require('os');

const activeUsers = new Set(); // Aktif kullanıcıları takip etmek için set

// /start komutu - Kullanıcıya dil seçimini sorar
bot.start(async (ctx) => {
  // Kullanıcının zaten işlemde olup olmadığını kontrol et
  if (activeUsers.has(ctx.from.id)) {
    return; // Eğer kullanıcı zaten işlem yapıyorsa, çık
  }

  activeUsers.add(ctx.from.id); // Kullanıcıyı aktif kullanıcılar listesine ekle

  await userFunctions.askLanguage(ctx); // Kullanıcıya dil seçimini sor
  userFunctions.addUserIfNotExists(ctx.from.id, ctx.from.username);

  // İşlem tamamlandıktan sonra kullanıcıyı listeden çıkar
  setTimeout(() => {
    activeUsers.delete(ctx.from.id);
  }, 10000); // 10 saniye içinde işlem yapılmasını engelle
});

// Dil seçimi işlemleri
bot.action("select_language_tr", async (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  await userFunctions.setUserLanguage(ctx, 'tr'); // Türkçe dilini seçer
  await userFunctions.checkSubscription(ctx); // Abonelik kontrolü yap
});

bot.action("select_language_ru", async (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  await userFunctions.setUserLanguage(ctx, 'ru'); // Rusça dilini seçer
  await userFunctions.checkSubscription(ctx); // Abonelik kontrolü yap
});

// Abonelik kontrolü - check_subscription callback'i
bot.action('check_subscription', async (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  await userFunctions.checkSubscription(ctx); // Abonelik durumunu kontrol et
});


// Ana menü işlemleri
bot.action("ana_menu", (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.userMainMenu(ctx); // Ana menüyü göster
});

// Bursiyer Adayı Menüsü işlemleri
bot.action("bursiyer_adayi", (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.bursiyerAdayiMenu(ctx); // Bursiyer adaylarına yönelik menü
});

// Bursiyer Menüsü işlemleri
bot.action("bursiyer", (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.bursiyerMenu(ctx); // Bursiyerlere yönelik menü
});

// Destek
bot.action('destek', async (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.supportFunction(ctx); 
});

// rosScholarshipApplicantMenu
bot.action('rosScholarshipApplicantMenu', async (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.rosScholarshipApplicantMenu(ctx); 
});

// rosScholarshipApplicantMenu
bot.action('SSSAI', async (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.SSSAI(ctx); 
});

// Başvuru prosedürü gösterme işlemi
bot.action("basvuru_proseduru", (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.basvuru_proseduru(ctx); // Başvuru prosedürünü göster
});

bot.command('duyuru', (ctx) => {
  userFunctions.getAllAdminTelegramIds().then(telegramIds => {
    let isIncluding = false;
    telegramIds.forEach(element => {
      if (parseInt(element) == parseInt(ctx.from.id)) {
        isIncluding = true;
      }
    });

    if (!isIncluding) {
      ctx.reply("🇷🇺 Русский дом в Анкаре:\n\nВы не имеете полномочий для выполнения этой операции! ❌")
        .then((message) => {
          // 3 saniye sonra uyarı mesajını otomatik silmek
          setTimeout(() => {
            ctx.deleteMessage(message.message_id).catch(function() {
              console.log("error while deleting cancel message");
            });
          }, 3000); // 3000 milisaniye = 3 saniye
        });
      return;
    } else {
      userFunctions.announcmentSequence(ctx);
    }
  });
});


bot.action("announcment_confirm", (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.getAllTelegramIds().then(telegramIds => {
    console.log(parseInt(telegramIds));
    telegramIds.forEach(element => {
      sendPromise = ctx.telegram.sendMessage(element, "🇷🇺 Rus evi Ankara: " + userFunctions.userLastAnnouncment[ctx.from.id]);
      sendPromise.catch(function () { console.log("Kullanıcı ID bulunamadı. Kullanıcı botu engellemiş olabilir " + element[1].toString()); });
    });
  });
});

bot.action("announcment_again", (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.announcmentSequence(ctx);
});

bot.action("announcment_cancel", (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  ctx.reply("🇷🇺 Русский дом в Анкаре:\n\nОперация отменена! ❌").then((message) => {
    // 3 saniye sonra mesajı sil
    setTimeout(() => {
      ctx.deleteMessage(message.message_id).catch(function() {
        console.log("error while deleting cancel message");
      });
    }, 3000); // 3000 milisaniye = 3 saniye
  });

  userFunctions.userMainMenu(ctx);
});

// Anlık dil değişimi (change language dynamic - cld)
bot.action('cld', (ctx) => {
  userFunctions.setUserLanguage(ctx, (userFunctions.getUserLanguage(ctx) == "ru") ? "tr" : "ru");
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.userMainMenu(ctx);
});

// İstenmeyen içerik türlerini engelleyen middleware
bot.on(['text', 'video', 'location', 'contact', 'sticker', 'voice', 'video_note', 'poll', 'photo', 'document'], (ctx) => {
  blockUnwantedContent(ctx);
  userFunctions.checkAdminReply(ctx);
});

// Botu çalıştır
bot.launch();
console.log('👸🏼 Luda: Bot çalışıyor');
