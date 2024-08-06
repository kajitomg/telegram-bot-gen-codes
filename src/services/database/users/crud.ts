import { getDateNow } from '../../../helpers/get-date-now';
import db from './database'

//CREATE

const createUser = async (selectors: { chat_id:string, user_id?:string, username:string }, callback) => {
  const dateNow = getDateNow().toISOString();
  const sql = 'INSERT INTO items (chat_id, user_id, username, last_session_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)';
  const response = await db.run(sql, [selectors.chat_id, selectors.user_id, selectors.username, dateNow, dateNow, dateNow],  function(err) {
    callback(err, {id:this.lastID});
  });
}

//READ_ALL_BY

const readUsers = async (callback) => {
  const sql = 'SELECT * FROM items';
  
  await db.all(sql, [],  callback);
}

//READ_ONE_BY

const readUserBy = async (selectors: { id?:number, chat_id?:string, user_id?:string, username?:string }, callback) => {
  const sqlSelectors = Object.entries(selectors)
  const sqlSet = sqlSelectors.map(([key]) => `${key} = ?`).join(', ')
  const sql = `SELECT * FROM items WHERE ${sqlSet} LIMIT 1`;
  
  await db.all(sql, [...sqlSelectors.map(([key, value]) => value)],  callback);
}

//UPDATE

const updateUserById = async (id:number, selectors: { chat_id?:string, user_id?:string, username?:string, last_session_at?:string }, callback) => {
  const dateNow = getDateNow();
  const sqlSelectors = Object.entries(selectors)
  const sqlSet = sqlSelectors.map(([key]) => `${key} = ?`).join(', ')
  const sql = `UPDATE items SET ${sqlSet}, updated_at = ? WHERE id = ?`;
  
  await db.run(sql, [ ...sqlSelectors.map(([key, value]) => value), dateNow, id ],  callback);
}

//DELETE

const deleteUserById = async (id:number, callback) => {
  const sql = `DELETE FROM items WHERE id = ?`;
  
  await db.run(sql, [], callback);
}

export default {
  createUser,
  readUsers,
  readUserBy,
  updateUserById,
  deleteUserById,
}