const express =require('express');
const sqlite3 = require('sqlite3').verbose();
const { nanoid } = require('nanoid');

const app = express();

const db = new sqlite3.Database('./urls.db');

app.use(express.json());

db.run("CREATE TABLE IF NOT EXISTS urls (id TEXT PRIMARY KEY, long_url TEXT)", (err) => {
    if (err) console.error("Table creation error:", err.message);
});

app.post('/shorten', (req, res) => {
    const { longUrl } = req.body;
    if (!longUrl) {
        return res.status(400).json({ error: 'Invalid URL' });
    }
    
    const id = nanoid(6);
    db.run("INSERT INTO urls (id, long_url) VALUES (?, ?)", [id, longUrl], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ shortUrl: `http://localhost:3000/${id}` });
    });
});

app.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get("SELECT long_url FROM urls WHERE id = ?", [id], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'Not found'});
        }
        res.redirect(row.long_url);
    });
});

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
