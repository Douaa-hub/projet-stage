const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',     
  user: 'root',      
  password: '',   
  database: 'sartex_db'      
});

db.connect((err) => {
  if (err) {
    console.error('Erreur connexion DB:', err);
    return;
  }
  console.log('Connecté à la base de données MySQL');
});

module.exports = db;


