const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
 require('dotenv').config();


const db = mysql.createConnection({
    host: '192.168.1.85', //kryptommonaie.com
    port: 3005,
    user: 'root',
    password: 'root_password',
    database: 'app_db'
});


db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

const app = express();
const port = 5101;


app.use(cors());
app.use(bodyParser.json());

// Create a new boutique
app.post('/boutiques', (req, res) => {
    const { nom, adresse, telephone, email, proprio } = req.body;
    const sql = 'INSERT INTO boutique (nom, adresse, telephone, email, proprio) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nom, adresse, telephone, email, proprio], (err, result) => {
        if (err) {
            console.error('Failed to create boutique', err);
            res.status(500).send('Failed to create boutique');
            return;
        }
        res.status(201).send('Boutique created successfully');
    });
});

// Get boutique ID by user email
app.get('/boutique/email/:email', (req, res) => {
    const { email } = req.params;
    const sql = 'SELECT id FROM boutique WHERE email = ?';
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Échec de la récupération de la boutique', err);
            res.status(500).send('Échec de la récupération de la boutique');
            return;
        }
        if (result.length === 0) {
            res.status(404).send('Aucune boutique trouvée pour cet utilisateur');
        } else {
            res.status(200).json(result[0]);
        }
    });
});

// Read all boutiques
app.get('/boutiques', (req, res) => {
    const sql = 'SELECT * FROM boutique';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Failed to fetch boutiques', err);
            res.status(500).send('Failed to fetch boutiques');
            return;
        }
        res.status(200).json(result);
    });
});

// Read boutiques by proprio email
app.get('/boutiques/email/:proprio', (req, res) => {
    const { proprio } = req.params;
    const sql = 'SELECT * FROM boutique WHERE proprio = ?';
    db.query(sql, [proprio], (err, result) => {
        if (err) {
            console.error('Failed to fetch boutiques by email', err);
            res.status(500).send('Failed to fetch boutiques by email');
            return;
        }
        res.status(200).json(result);
    });
});

// Read a specific boutique by ID
app.get('/boutiques/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM boutique WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Failed to fetch boutique', err);
            res.status(500).send('Failed to fetch boutique');
            return;
        }
        res.status(200).json(result[0]);
    });
});

// Update a boutique
app.put('/boutiques/:id', (req, res) => {
    const { nom, adresse, telephone, email } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE boutique SET nom = ?, adresse = ?, telephone = ?, email = ? WHERE id = ?';
    db.query(sql, [nom, adresse, telephone, email, id], (err, result) => {
        if (err) {
            console.error('Failed to update boutique', err);
            res.status(500).send('Failed to update boutique');
            return;
        }
        res.status(200).send('Boutique updated successfully');
    });
});

// Delete a boutique
app.delete('/boutiques/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM boutique WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Failed to delete boutique', err);
            res.status(500).send('Failed to delete boutique');
            return;
        }
        res.status(204).send(); // No content to send back
    });
});



// Add tissu to a boutique
app.post('/tissus', (req, res) => {
    const { nom, stock, unite, boutique_id } = req.body;
    const sql = 'INSERT INTO tissu (nom, stock, unite, boutique_id) VALUES (?, ?, ?, ?)';
    db.query(sql, [nom, stock, unite, boutique_id], (err, result) => {
        if (err) {
            console.error('Failed to add tissu', err);
            res.status(500).send('Failed to add tissu');
            return;
        }
        res.status(201).send('Tissu added successfully');
    });
});

// Read all tissus for a specific boutique
app.get('/boutiques/:id/tissus', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM tissu WHERE boutique_id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Failed to fetch tissus', err);
            res.status(500).send('Failed to fetch tissus');
            return;
        }
        res.status(200).json(result);
    });
});

// ▶ Tous les tissus (code-barres)
app.get('/api/tissus', (req, res) => {
    const sql = `
        SELECT t.id, t.nom, t.stock, t.unite, b.nom AS boutique_nom
        FROM tissu t
        JOIN boutique b ON t.boutique_id = b.id
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('❌ Erreur tissus/code-barres :', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(results);
    });
});
/* Differentes routes du superadmin */

//route pour superadmin
app.get('/api/superadmin/admins', (req, res) => {
  const sql = `
    SELECT proprio AS email, id, nom
    FROM boutique
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erreur récupération admins et boutiques', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    const grouped = {};

    result.forEach(row => {
      const email = row.email.trim();

      if (!grouped[email]) {
        grouped[email] = [];
      }

      grouped[email].push({
        id: row.id,    // ✅ INCLUS maintenant
        nom: row.nom
      });
    });

    const formatted = Object.entries(grouped).map(([email, boutiques]) => ({
      email,
      boutiques
    }));

    res.json(formatted);
  });
});



 
// Supprimer une boutique par son ID
// 🔁 Supprimer d'abord les logs → ensuite tissus → ensuite boutique
app.delete('/api/superadmin/delete-boutique/:id', (req, res) => {
  const id = req.params.id;

  const deleteLogs = `DELETE FROM log_vente WHERE boutique_id = ?`;
  const deleteTissus = `DELETE FROM tissu WHERE boutique_id = ?`;
  const deleteBoutique = `DELETE FROM boutique WHERE id = ?`;

  db.query(deleteLogs, [id], (err) => {
    if (err) {
      console.error('❌ Erreur suppression logs', err);
      return res.status(500).json({ error: 'Erreur suppression logs' });
    }

    db.query(deleteTissus, [id], (err) => {
      if (err) {
        console.error('❌ Erreur suppression tissus', err);
        return res.status(500).json({ error: 'Erreur suppression tissus' });
      }

      db.query(deleteBoutique, [id], (err) => {
        if (err) {
          console.error('❌ Erreur suppression boutique', err);
          return res.status(500).json({ error: 'Erreur suppression boutique' });
        }

        return res.status(200).json({ message: 'Boutique et données supprimées' });
      });
    });
  });
});



//voir statistiques pour le superadmin 
app.get('/api/superadmin/stats', async (req, res) => {
    const stats = {};

    const queries = [
        { key: 'total_boutiques', sql: 'SELECT COUNT(*) AS count FROM boutique' },
        { key: 'total_tissus', sql: 'SELECT COUNT(*) AS count FROM tissu' },
        { key: 'stock_total', sql: 'SELECT SUM(stock) AS total FROM tissu' },
        { key: 'ventes_globales', sql: 'SELECT SUM(price * quantity) AS total FROM log_vente' },
    ];

    try {
        for (const q of queries) {
            const [rows] = await db.promise().query(q.sql);
            stats[q.key] = rows[0].count ?? rows[0].total ?? 0;
        }

        res.json(stats);
    } catch (err) {
        console.error("Erreur statistiques globales", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

//route filtrée 
app.get('/api/superadmin/logs', (req, res) => {
  const { start, end, boutique, admin } = req.query;

  let baseSql = `
    SELECT log_vente.*, tissu.nom AS tissu_nom, tissu.unite, boutique.nom AS boutique_nom, boutique.proprio
    FROM log_vente
    INNER JOIN tissu ON log_vente.tissu_id = tissu.id
    INNER JOIN boutique ON log_vente.boutique_id = boutique.id
    WHERE 1 = 1
  `;

  const params = [];

  if (start && end) {
    baseSql += ` AND log_vente.date BETWEEN ? AND ?`;
    params.push(start, end);
  }

  if (boutique) {
    baseSql += ` AND boutique.nom LIKE ?`;
    params.push(`%${boutique}%`);
  }

  if (admin) {
    baseSql += ` AND boutique.proprio LIKE ?`;
    params.push(`%${admin}%`);
  }

  baseSql += ` ORDER BY log_vente.date DESC`;

  db.query(baseSql, params, (err, result) => {
    if (err) {
      console.error('Erreur récupération des logs superadmin', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.status(200).json(result);
  });
});


// Read a specific tissu by ID
app.get('/tissus/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM tissu WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Failed to fetch tissu', err);
            res.status(500).send('Failed to fetch tissu');
            return;
        }
        res.status(200).json(result[0]);
    });
});

// Update tissu details
app.put('/tissus/:id', (req, res) => {
    const { nom, stock, unite } = req.body;
    const { id } = req.params;
    const sql = 'UPDATE tissu SET nom = ?, stock = ?, unite = ? WHERE id = ?';
    db.query(sql, [nom, stock, unite, id], (err, result) => {
        if (err) {
            console.error('Failed to update tissu', err);
            res.status(500).send('Failed to update tissu');
            return;
        }
        res.status(200).send('Tissu updated successfully');
    });
});

// Delete tissu
app.delete('/tissus/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM tissu WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Failed to delete tissu', err);
            res.status(500).send('Failed to delete tissu');
            return;
        }
        res.status(204).send();
    });
});

// Get tissus by user email
app.get('/tissus/email/:email', (req, res) => {
    const { email } = req.params;
    const sql = 'SELECT t.* FROM tissu t INNER JOIN boutique b ON t.boutique_id = b.id WHERE b.email = ?';
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Échec de la récupération des tissus', err);
            res.status(500).send('Échec de la récupération des tissus');
            return;
        }
        res.status(200).json(result);
    });
});

// Sell tissu and log sale
app.post('/tissus/:id/sell', (req, res) => {
    const { id } = req.params;
    const { quantity, price } = req.body;

    const sqlSelect = 'SELECT * FROM tissu WHERE id = ?';
    db.query(sqlSelect, [id], (err, result) => {
        if (err) {
            console.error('Échec de la récupération du stock de tissu', err);
            res.status(500).send('Échec de la récupération du stock de tissu');
            return;
        }

        const tissu = result[0];
        if (quantity > tissu.stock) {
            res.status(400).send('La quantité à vendre dépasse le stock disponible');
            return;
        }

        const sqlUpdate = 'UPDATE tissu SET stock = stock - ? WHERE id = ?';
        db.query(sqlUpdate, [quantity, id], (err, result) => {
            if (err) {
                console.error('Échec de la mise à jour du stock de tissu', err);
                res.status(500).send('Échec de la mise à jour du stock de tissu');
                return;
            }

            const sqlInsertLog = 'INSERT INTO log_vente (tissu_id, boutique_id, quantity, price, date) VALUES (?, ?, ?, ?, NOW())';
            db.query(sqlInsertLog, [id, tissu.boutique_id, quantity, price], (err, result) => {
                if (err) {
                    console.error('Échec de l\'enregistrement du log de vente', err);
                    res.status(500).send('Échec de l\'enregistrement du log de vente');
                    return;
                }
                res.status(200).send('Vente réussie');
            });
        });
    });
});

// Get sales logs for all boutiques (admin view)
app.get('/api/logs', (req, res) => {
    const sql = `
        SELECT log_vente.*, tissu.nom AS tissu_nom, tissu.unite, boutique.nom AS boutique_nom
        FROM log_vente
        INNER JOIN tissu ON log_vente.tissu_id = tissu.id
        INNER JOIN boutique ON log_vente.boutique_id = boutique.id
        ORDER BY date DESC`;
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Échec de la récupération des logs de vente', err);
            res.status(500).send('Échec de la récupération des logs de vente');
            return;
        }
        res.status(200).json(result);
    });
});

// Get sales logs for a specific boutique by boutique ID
app.get('/logs/boutique/:boutiqueId', (req, res) => {
    const { boutiqueId } = req.params;
    const sql = `
        SELECT log_vente.*, tissu.nom AS tissu_nom, tissu.unite, boutique.nom AS boutique_nom
        FROM log_vente
        INNER JOIN tissu ON log_vente.tissu_id = tissu.id
        INNER JOIN boutique ON log_vente.boutique_id = boutique.id
        WHERE log_vente.boutique_id = ?
        ORDER BY date DESC`;
    db.query(sql, [boutiqueId], (err, result) => {
        if (err) {
            console.error('Échec de la récupération des logs de vente', err);
            res.status(500).send('Échec de la récupération des logs de vente');
            return;
        }
        res.status(200).json(result);
    });
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
