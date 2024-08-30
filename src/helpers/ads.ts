require('dotenv').config()

export default async function SendPostToChat(chatId) {
  const token = process.env.ADS_TOKEN;
  
  const headers = new Headers();
  headers.append("Authorization", `bearer ${token}`);
  
  const sendPostDto = { SendToChatId: chatId };
  const json = JSON.stringify(sendPostDto);
  const content = new Blob([json], { type: "application/json" });
  
  const response = await fetch("https://api.gramads.net/ad/SendPost", {
    method: "POST",
    body: content,
    headers: headers,
  });
  
  if (!response.ok) {
    // something went wrong
    return;
  }
  
  const result = await response.text();
  
  return result
}