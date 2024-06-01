const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'note-db',
  password: '29930427',
  port: 5432,
});

const app = express();
app.use(bodyParser.json());
app.use(cors()); 

const SECRET_KEY = 'your_secret_key';  

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access Denied');

  jwt.verify(token.split(' ')[1], SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next();
  });
}

function validateEmail(email) {
  const regex = /^[^\s@]+@(gmail\.com|outlook\.com|hotmail\.com)$/;
  return regex.test(email);
}

function validatePassword(password) {
  const regex = /^[A-Za-z0-9]{8,}$/;
  return regex.test(password);
}

app.post('/users/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).send('Invalid email format. Allowed: @gmail.com, @outlook.com, @hotmail.com');
    }

    if (!validatePassword(password)) {
      return res.status(400).send('Password must be at least 8 characters long and contain no special characters.');
    }

    const userExists = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password, email) VALUES ($1, $2, $3)', [username, hashedPassword, email]);
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering user');
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    console.error('Error logging in', error);
    res.status(500).send('Error logging in');
  }
});


app.post('/notes', authenticateToken, async (req, res) => {
  try {
    const { title, content, color, fontSize, fontFamily } = req.body;
    await pool.query('INSERT INTO notes (title, content, color, font_size, font_family, user_id) VALUES ($1, $2, $3, $4, $5, $6)', [title, content, color, fontSize, fontFamily, req.user.id]);
    res.status(201).send('Note created successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating note');
  }
});

app.get('/notes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notes WHERE user_id = $1', [req.user.id]);
    const notes = result.rows;
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving notes');
  }
});

app.put('/notes/:noteId', authenticateToken, async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const { title, content, color, fontSize, fontFamily } = req.body;
    const result = await pool.query('UPDATE notes SET title = $1, content = $2, color = $3, font_size = $4, font_family = $5 WHERE id = $6 AND user_id = $7', [title, content, color, fontSize, fontFamily, noteId, req.user.id]);
    if (result.rowCount === 0) return res.status(404).send('Note not found');
    res.send('Note updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating note');
  }
});

app.delete('/notes/:noteId', authenticateToken, async (req, res) => {
  try {
    const noteId = req.params.noteId;
    const result = await pool.query('DELETE FROM notes WHERE id = $1 AND user_id = $2', [noteId, req.user.id]);
    if (result.rowCount === 0) return res.status(404).send('Note not found');
    res.send('Note deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error deleting note');
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
