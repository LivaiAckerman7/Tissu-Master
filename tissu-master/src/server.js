const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Utiliser mysql2/promise
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Configurer le pool MySQL
const db = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'db_user',
  password: process.env.DB_PASSWORD || 'db_user_pass',
  database: process.env.DB_NAME || 'app_db',
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Tester la connexion au démarrage
db.getConnection()
  .then(conn => {
    console.log('✅ Connexion MySQL établie');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Échec de la connexion MySQL:', err);
    process.exit(1);
  });

// Middleware
app.use(express.json()); // Remplace bodyParser.json()
app.use(cors({
  origin: [
    'http://localhost',
    'http://192.168.1.85',
    'https://tissus.kryptomonnaie.com',
    'https://secure.kryptomonnaie.com',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-client-origin'],
}));

// Create a new boutique
app.post('/boutiques', async (req, res) => {
  const { nom, adresse, telephone, email, proprio } = req.body;
  console.log('Requête POST /boutiques reçue:', { nom, adresse, telephone, email, proprio });

  if (!nom || !adresse || !telephone || !email || !proprio) {
    console.error('Champs manquants:', req.body);
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO boutique (nom, adresse, telephone, email, proprio) VALUES (?, ?, ?, ?, ?)',
      [nom, adresse, telephone, email, proprio]
    );
    console.log('✅ Boutique créée:', { insertId: result.insertId });
    res.status(201).json({ message: 'Boutique créée avec succès' });
  } catch (err) {
    console.error('❌ Échec de la création de la boutique:', err);
    res.status(500).json({ error: 'Échec de la création de la boutique' });
  }
});

// Get boutique ID by user email
app.get('/boutique/email/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const [results] = await db.query('SELECT id FROM boutique WHERE email = ?', [email]);
    if (results.length === 0) {
      res.status(404).json({ error: 'Aucune boutique trouvée pour cet utilisateur' });
    } else {
      res.status(200).json(results[0]);
    }
  } catch (err) {
    console.error('❌ Échec de la récupération de la boutique:', err);
    res.status(500).json({ error: 'Échec de la récupération de la boutique' });
  }
});

// Read all boutiques
app.get('/boutiques', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM boutique');
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Failed to fetch boutiques:', err);
    res.status(500).json({ error: 'Failed to fetch boutiques' });
  }
});

// Read boutiques by proprio email
app.get('/boutiques/email/:proprio', async (req, res) => {
  const { proprio } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM boutique WHERE proprio = ?', [proprio]);
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Failed to fetch boutiques by email:', err);
    res.status(500).json({ error: 'Failed to fetch boutiques by email' });
  }
});

// Read a specific boutique by ID
app.get('/boutiques/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM boutique WHERE id = ?', [id]);
    res.status(200).json(results[0]);
  } catch (err) {
    console.error('❌ Failed to fetch boutique:', err);
    res.status(500).json({ error: 'Failed to fetch boutique' });
  }
});

// Update a boutique
app.put('/boutiques/:id', async (req, res) => {
  const { nom, adresse, telephone, email } = req.body;
  const { id } = req.params;
  try {
    await db.query(
      'UPDATE boutique SET nom = ?, adresse = ?, telephone = ?, email = ? WHERE id = ?',
      [nom, adresse, telephone, email, id]
    );
    res.status(200).json({ message: 'Boutique updated successfully' });
  } catch (err) {
    console.error('❌ Failed to update boutique:', err);
    res.status(500).json({ error: 'Failed to update boutique' });
  }
});

// Delete a boutique
app.delete('/boutiques/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM boutique WHERE id = ?', [id]);
    res.status(204).json();
  } catch (err) {
    console.error('❌ Failed to delete boutique:', err);
    res.status(500).json({ error: 'Failed to delete boutique' });
  }
});

// Add tissu to a boutique
app.post('/tissus', async (req, res) => {
  const { nom, stock, unite, boutique_id } = req.body;
  try {
    await db.query(
      'INSERT INTO tissu (nom, stock, unite, boutique_id) VALUES (?, ?, ?, ?)',
      [nom, stock, unite, boutique_id]
    );
    res.status(201).json({ message: 'Tissu added successfully' });
  } catch (err) {
    console.error('❌ Failed to add tissu:', err);
    res.status(500).json({ error: 'Failed to add tissu' });
  }
});

// Read all tissus for a specific boutique
app.get('/boutiques/:id/tissus', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM tissu WHERE boutique_id = ?', [id]);
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Failed to fetch tissus:', err);
    res.status(500).json({ error: 'Failed to fetch tissus' });
  }
});

// Tous les tissus (code-barres)
app.get('/api/tissus', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT t.id, t.nom, t.stock, t.unite, b.nom AS boutique_nom
      FROM tissu t
      JOIN boutique b ON t.boutique_id = b.id
    `);
    res.json(results);
  } catch (err) {
    console.error('❌ Erreur tissus/code-barres:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour superadmin
app.get('/api/superadmin/admins', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT proprio AS email, id, nom
      FROM boutique
    `);
    const grouped = {};
    results.forEach(row => {
      const email = row.email.trim();
      if (!grouped[email]) {
        grouped[email] = [];
      }
      grouped[email].push({ id: row.id, nom: row.nom });
    });
    const formatted = Object.entries(grouped).map(([email, boutiques]) => ({
      email,
      boutiques,
    }));
    res.json(formatted);
  } catch (err) {
    console.error('❌ Erreur récupération admins et boutiques:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Supprimer une boutique par son ID
app.delete('/api/superadmin/delete-boutique/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM log_vente WHERE boutique_id = ?', [id]);
    await db.query('DELETE FROM tissu WHERE boutique_id = ?', [id]);
    await db.query('DELETE FROM boutique WHERE id = ?', [id]);
    res.status(200).json({ message: 'Boutique et données supprimées' });
  } catch (err) {
    console.error('❌ Erreur suppression boutique:', err);
    res.status(500).json({ error: 'Erreur suppression boutique' });
  }
});

// Statistiques pour le superadmin
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
      const [rows] = await db.query(q.sql);
      stats[q.key] = rows[0].count ?? rows[0].total ?? 0;
    }
    res.json(stats);
  } catch (err) {
    console.error('❌ Erreur statistiques globales:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Logs filtrés pour superadmin
app.get('/api/superadmin/logs', async (req, res) => {
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

  try {
    const [results] = await db.query(baseSql, params);
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Erreur récupération des logs superadmin:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Read a specific tissu by ID
app.get('/tissus/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM tissu WHERE id = ?', [id]);
    res.status(200).json(results[0]);
  } catch (err) {
    console.error('❌ Failed to fetch tissu:', err);
    res.status(500).json({ error: 'Failed to fetch tissu' });
  }
});

// Update tissu details
app.put('/tissus/:id', async (req, res) => {
  const { nom, stock, unite } = req.body;
  const { id } = req.params;
  try {
    await db.query(
      'UPDATE tissu SET nom = ?, stock = ?, unite = ? WHERE id = ?',
      [nom, stock, unite, id]
    );
    res.status(200).json({ message: 'Tissu updated successfully' });
  } catch (err) {
    console.error('❌ Failed to update tissu:', err);
    res.status(500).json({ error: 'Failed to update tissu' });
  }
});

// Delete tissu
app.delete('/tissus/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM tissu WHERE id = ?', [id]);
    res.status(204).json();
  } catch (err) {
    console.error('❌ Failed to delete tissu:', err);
    res.status(500).json({ error: 'Failed to delete tissu' });
  }
});

// Get tissus by user email
app.get('/tissus/email/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const [results] = await db.query(
      'SELECT t.* FROM tissu t INNER JOIN boutique b ON t.boutique_id = b.id WHERE b.email = ?',
      [email]
    );
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Échec de la récupération des tissus:', err);
    res.status(500).json({ error: 'Échec de la récupération des tissus' });
  }
});

// Sell tissu and log sale
app.post('/tissus/:id/sell', async (req, res) => {
  const { id } = req.params;
  const { quantity, price } = req.body;

  try {
    const [results] = await db.query('SELECT * FROM tissu WHERE id = ?', [id]);
    const tissu = results[0];
    if (!tissu) {
      return res.status(404).json({ error: 'Tissu non trouvé' });
    }
    if (quantity > tissu.stock) {
      return res.status(400).json({ error: 'La quantité à vendre dépasse le stock disponible' });
    }

    await db.query('UPDATE tissu SET stock = stock - ? WHERE id = ?', [quantity, id]);
    await db.query(
      'INSERT INTO log_vente (tissu_id, boutique_id, quantity, price, date) VALUES (?, ?, ?, ?, NOW())',
      [id, tissu.boutique_id, quantity, price]
    );
    res.status(200).json({ message: 'Vente réussie' });
  } catch (err) {
    console.error('❌ Échec de la vente:', err);
    res.status(500).json({ error: 'Échec de la vente' });
  }
});

// Get sales logs for all boutiques (admin view)
app.get('/api/logs', async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT log_vente.*, tissu.nom AS tissu_nom, tissu.unite, boutique.nom AS boutique_nom
      FROM log_vente
      INNER JOIN tissu ON log_vente.tissu_id = tissu.id
      INNER JOIN boutique ON log_vente.boutique_id = boutique.id
      ORDER BY date DESC
    `);
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Échec de la récupération des logs de vente:', err);
    res.status(500).json({ error: 'Échec de la récupération des logs de vente' });
  }
});

// Get sales logs for a specific boutique by boutique ID
app.get('/logs/boutique/:boutiqueId', async (req, res) => {
  const { boutiqueId } = req.params;
  try {
    const [results] = await db.query(
      `
      SELECT log_vente.*, tissu.nom AS tissu_nom, tissu.unite, boutique.nom AS boutique_nom
      FROM log_vente
      INNER JOIN tissu ON log_vente.tissu_id = tissu.id
      INNER JOIN boutique ON log_vente.boutique_id = boutique.id
      WHERE log_vente.boutique_id = ?
      ORDER BY date DESC
    `,
      [boutiqueId]
    );
    res.status(200).json(results);
  } catch (err) {
    console.error('❌ Échec de la récupération des logs de vente:', err);
    res.status(500).json({ error: 'Échec de la récupération des logs de vente' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});