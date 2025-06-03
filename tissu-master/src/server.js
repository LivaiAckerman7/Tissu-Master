const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
 require('dotenv').config();


const db = mysql.createConnection({
	host: 'localhost', //kryptommonaie.com
    port: 3306,
    user: 'root',
    password: 'passer',
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
const port = 5000;


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

//route pour superadmin
app.get('/api/superadmin/admins', (req, res) => {
  const sql = `
    SELECT proprio AS email, GROUP_CONCAT(nom SEPARATOR ',') AS boutiques
    FROM boutique
    GROUP BY proprio
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Erreur récupération admins et boutiques', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    const formatted = result.map(r => ({
      email: r.email,
      boutiques: r.boutiques
        ? r.boutiques.split(',').map(nom => ({ nom }))
        : [],
    }));

    res.json(formatted);
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
