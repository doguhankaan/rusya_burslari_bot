const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const fs = require('fs');
const config = require('./config');
const userFunctions = require('./userFunctions');
const bot = new Telegraf(config.TELEGRAM_API_TOKEN);
const { blockUnwantedContent, userSteps } = require('./userFunctions'); // Fonksiyonları import et
const { type } = require('os');

const activeUsers = new Set(); 

bot.start(async (ctx) => {
  if (activeUsers.has(ctx.from.id)) {
    return; 
  }

  activeUsers.add(ctx.from.id); 

  await userFunctions.askLanguage(ctx); 

  setTimeout(() => {
    activeUsers.delete(ctx.from.id);
  }, 10000); 
});

bot.action("select_language_tr", async (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  await userFunctions.setUserLanguage(ctx, 'tr'); 
  await userFunctions.checkSubscription(ctx); 
});

bot.action("select_language_ru", async (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  await userFunctions.setUserLanguage(ctx, 'ru'); 
  await userFunctions.checkSubscription(ctx); 
});

bot.action('check_subscription', async (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  await userFunctions.checkSubscription(ctx); 
});

bot.action("ana_menu", (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.userMainMenu(ctx); 
});

bot.action("bursiyer_adayi", (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.bursiyerAdayiMenu(ctx); 
});

bot.action("bursiyer", (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.bursiyerMenu(ctx);
});

bot.action('destek', async (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.supportFunction(ctx); 
});

bot.action('rosScholarshipApplicantMenu', async (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.rosScholarshipApplicantMenu(ctx); 
});

bot.action("basvuru_proseduru", (ctx) => {
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.basvuru_proseduru(ctx); 
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
          setTimeout(() => {
            ctx.deleteMessage(message.message_id).catch(function() {
              console.log("error while deleting cancel message");
            });
          }, 3000); 
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
    setTimeout(() => {
      ctx.deleteMessage(message.message_id).catch(function() {
        console.log("error while deleting cancel message");
      });
    }, 3000); 
  });

  userFunctions.userMainMenu(ctx);
});


bot.action('cld', (ctx) => {
  userFunctions.setUserLanguage(ctx, (userFunctions.getUserLanguage(ctx) == "ru") ? "tr" : "ru");
  ctx.deleteMessage().catch(function() {console.log("error")});
  userFunctions.userMainMenu(ctx);
});


bot.on(['text', 'video', 'location', 'contact', 'sticker', 'voice', 'video_note', 'poll', 'photo', 'document'], (ctx) => {
  blockUnwantedContent(ctx);
  userFunctions.checkAdminReply(ctx);
});

bot.launch();
console.log('👸🏼 Luda: Bot çalışıyor');
