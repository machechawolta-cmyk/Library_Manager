const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { createSession, requireAuth, requireAdmin } = require('../auth');

const handle = (res, err) => {
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Membership ID already exists' });
  console.error(err);
  res.status(500).json({ error: 'Server error' });
};

router.post('/login', async (req, res) => {
  const { membership_id, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE membership_id=?', [membership_id]);
    if (!rows.length || !bcrypt.compareSync(String(password || ''), rows[0].password))
      return res.status(401).json({ error: 'Invalid membership ID or password' });
    const u = rows[0];
    const user = { id: u.id, name: u.name, membership_id: u.membership_id, role: u.role };
    res.json({ ...user, token: createSession(user) });
  } catch (e) { handle(res, e); }
});

router.use(requireAuth);

// Lets the borrow form list people (id + name only)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, membership_id, role FROM users ORDER BY name');
    res.json(rows);
  } catch (e) { handle(res, e); }
});

router.post('/', requireAdmin, async (req, res) => {
  const { name, membership_id, role, password } = req.body;
  if (!name || !membership_id) return res.status(400).json({ error: 'Name and membership ID are required' });
  try {
    const hash = bcrypt.hashSync(password || '1234', 10);
    const [r] = await db.query(
      'INSERT INTO users (name, membership_id, role, password) VALUES (?,?,?,?)',
      [name, membership_id, role || 'member', hash]);
    res.status(201).json({ id: r.insertId, name, membership_id, role: role || 'member' });
  } catch (e) { handle(res, e); }
});

router.put('/:id', requireAdmin, async (req, res) => {
  const { name, membership_id, role, password } = req.body;
  if (!name || !membership_id) return res.status(400).json({ error: 'Name and membership ID are required' });
  try {
    let sql = 'UPDATE users SET name=?, membership_id=?, role=?';
    const params = [name, membership_id, role || 'member'];
    if (password) { sql += ', password=?'; params.push(bcrypt.hashSync(password, 10)); }
    const [r] = await db.query(sql + ' WHERE id=?', [...params, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated' });
  } catch (e) { handle(res, e); }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account' });
  try {
    const [r] = await db.query('DELETE FROM users WHERE id=?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (e) { handle(res, e); }
});

module.exports = router;
