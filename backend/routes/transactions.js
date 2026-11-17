const router = require('express').Router();
const db = require('../db');
const { requireAuth } = require('../auth');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT t.id, t.type, t.quantity, t.created_at, b.title, u.name AS user_name
       FROM transactions t
       JOIN books b ON b.id = t.book_id
       LEFT JOIN users u ON u.id = t.user_id
       ORDER BY t.created_at DESC, t.id DESC`);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// type: 'ADD' (new stock arrives) or 'BORROW' (stock deducted)
router.post('/', async (req, res) => {
  const { book_id, type } = req.body;
  const quantity = Number(req.body.quantity);
  if (type === 'ADD' && req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can add stock' });
  // members always borrow as themselves; admins may choose the borrower
  const user_id = req.user.role === 'admin' && type === 'BORROW' ? (req.body.user_id || req.user.id) : req.user.id;
  if (!book_id || !['ADD', 'BORROW'].includes(type) || !Number.isInteger(quantity) || quantity < 1)
    return res.status(400).json({ error: 'Book, type and a quantity of at least 1 are required' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [books] = await conn.query('SELECT quantity FROM books WHERE id=? FOR UPDATE', [book_id]);
    if (!books.length) { await conn.rollback(); return res.status(404).json({ error: 'Book not found' }); }
    if (type === 'BORROW' && books[0].quantity < quantity) {
      await conn.rollback();
      return res.status(400).json({ error: `Not enough stock (only ${books[0].quantity} available)` });
    }
    const delta = type === 'ADD' ? quantity : -quantity;
    await conn.query('UPDATE books SET quantity = quantity + ? WHERE id=?', [delta, book_id]);
    await conn.query('INSERT INTO transactions (book_id, user_id, type, quantity) VALUES (?,?,?,?)',
      [book_id, user_id || null, type, quantity]);
    await conn.commit();
    res.status(201).json({ message: 'Transaction recorded' });
  } catch (e) {
    await conn.rollback();
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  } finally { conn.release(); }
});

module.exports = router;
