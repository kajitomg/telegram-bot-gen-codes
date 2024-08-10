import db from '../../services/database';

export class UsersSlices {
  constructor() {}
  
  
  static getUserByChatId = async function(
    chatId: number,
    {
      successCallback,
      errorCallback
    }:{ successCallback?:(row) => Promise<void>, errorCallback?:(err) => Promise<void> }
  ) {
    await db.userDB.readUserBy({chat_id: chatId}, async (err, row) => {
      if (err) {
        console.log(err);
        console.log('Произошла ошибка при поиске пользователя');
        await errorCallback(err)
        return null
      } else {
        await successCallback(row)
      }
    })
  }
  
  static createUser = async function(
    {
      chatId,
      userId,
      username
    }: { chatId:number, userId: string, username:string },
    {
      successCallback,
      errorCallback
    }:{ successCallback?:(row) => Promise<void>, errorCallback?:(err) => Promise<void> }
  ) {
    await db.userDB.createUser({
      chat_id:chatId,
      user_id:userId,
      username:username,
    }, async (err, row) => {
      if(err) {
        console.log('Произошла ошибка при создании пользователя')
        await errorCallback(err)
      } else {
        await successCallback(row)
      }
    })
  }
}