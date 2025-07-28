require('dotenv').config();
const app = require('./src/express');

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Calendar App API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
