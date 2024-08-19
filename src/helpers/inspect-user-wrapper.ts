import { UsersSlices } from '../slices/users';

export default async function (chatId, author, callbackOnNew?: () => Promise<void>, callbackOnEx?: () => Promise<void>) {
  try {
    await UsersSlices.getUserByChatId(
      chatId,
      {
        successCallback: async (row) => {
          if (row.length === 0) {
            await UsersSlices.createUser(
              { userId: author.username, chatId, username: author.first_name },
              {
                successCallback: callbackOnNew
              })
          } else {
            await UsersSlices.updateUser({
              id:row[0].id,
              selectors: {
                chatId,
                userId: author.username,
                username: author.first_name,
              },
            },{
              successCallback: callbackOnEx
            })
          }
        }
      })
  } catch (error) {
    console.log(author.username + ' ' + error.response?.error_code + ' ' + error.response?.description)
  }
}