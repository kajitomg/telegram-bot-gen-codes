import sqlite3 from 'sqlite3';

const Database = sqlite3.verbose()
const DB_NAME = 'test.hamtaborbot_users.db'

const db = new Database.Database(DB_NAME, (err) => {
  if(err) {
    console.log(err.message);
  } else {
    console.log('Connected to Database');
    db.run('CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY AUTOINCREMENT, chat_id TEXT, user_id TEXT, username TEXT, last_session_at TEXT,  created_at TEXT, updated_at TEXT)', () => {
      if(err) {
        console.log(err.message);
      } else {
        console.log('Table created or existed');
      }
    });
  }
})

export default db
