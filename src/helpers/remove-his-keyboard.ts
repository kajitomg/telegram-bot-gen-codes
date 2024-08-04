
export function removeHisKeyboard (bot, callbackQuery) {
  const messageText = callbackQuery.message.text;
  const messageId = callbackQuery.message.message_id;
  return bot
    .editMessageText(messageText, {
      message_id: messageId,
      chat_id: callbackQuery.from.id,
      reply_markup: {
        inline_keyboard: [],
      },
    })
};