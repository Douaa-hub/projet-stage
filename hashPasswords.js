const bcrypt = require('bcrypt');
const db = require('./config/db'); 

// Fonction principale async pour le traitement
async function hashPasswords() {
  try {
    // Récupérer tous les utilisateurs
    db.query('SELECT id, mot_de_passe FROM Utilisateur', async (err, users) => {
      if (err) {
        console.error('Erreur lors de la récupération des utilisateurs :', err);
        process.exit(1);
      }

      for (const user of users) {
        // Vérifie si le mot de passe est probablement non hashé (ex: longueur < 60)
        if (user.mot_de_passe.length < 60) {
          // Hasher le mot de passe
          const hashed = await bcrypt.hash(user.mot_de_passe, 10);

          // Mettre à jour la base
          await new Promise((resolve, reject) => {
            db.query('UPDATE Utilisateur SET mot_de_passe = ? WHERE id = ?', [hashed, user.id], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });

          console.log(`Mot de passe haché pour utilisateur ID=${user.id}`);
        } else {
          console.log(`Mot de passe déjà haché pour utilisateur ID=${user.id}`);
        }
      }

      console.log('Mise à jour des mots de passe terminée.');
      process.exit(0);
    });
  } catch (error) {
    console.error('Erreur:', error);
    process.exit(1);
  }
}

hashPasswords();
