// app.js
const express = require('express');
const app = express();

app.use(express.json());

// Sample route
app.get('/api/users', (req, res) => {
  res.status(200).json({ users: ['Alice', 'Bob'] });
});

module.exports = app; // 👈 export the app without listening
