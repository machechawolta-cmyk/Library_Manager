const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/books', require('./routes/books'));
app.use('/users', require('./routes/users'));
app.use('/transactions', require('./routes/transactions'));

app.get('/', (req, res) => res.json({ message: 'Library API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
