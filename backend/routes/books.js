const router = require('express').Router();
const db = require('../db');
const { requireAuth, requireAdmin } = require('../auth');

router.use(requireAuth);

const handle = (res, err) => {
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'ISBN already exists' });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
};

router.get('/', async (req, res) => {
  try { const [rows] = await db.query('SELECT * FROM books ORDER BY title'); res.json(rows); }
  catch (e) { handle(res, e); }
});

router.post('/', requireAdmin, async (req, res) => {
  const { title, author, genre, isbn, quantity } = req.body;
  if (!title || !author || !isbn || quantity < 0 || quantity === undefined)
    return res.status(400).json({ error: 'Title, author, ISBN and a valid quantity are required' });
  try {
    const [r] = await db.query(
      'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?,?,?,?,?)',
      [title, author, genre || null, isbn, quantity]);
    res.status(201).json({ id: r.insertId, title, author, genre, isbn, quantity });
  } catch (e) { handle(res, e); }
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { title, author, genre, isbn, quantity } = req.body;
  if (!title || !author || !isbn || quantity < 0)
    return res.status(400).json({ error: 'Invalid book data' });
  try {
    const [r] = await db.query(
      'UPDATE books SET title=?, author=?, genre=?, isbn=?, quantity=? WHERE id=?',
      [title, author, genre || null, isbn, quantity, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book updated' });
  } catch (e) { handle(res, e); }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const [[{ n }]] = await db.query('SELECT COUNT(*) AS n FROM transactions WHERE book_id=?', [req.params.id]);
    if (n > 0) return res.status(409).json({ error: 'This book has transaction history and cannot be deleted' });
    const [r] = await db.query('DELETE FROM books WHERE id=?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (e) { handle(res, e); }
});

module.exports = router;
