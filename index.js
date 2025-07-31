require('dotenv').config();
const { app } = require('./src/app');

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Calendar App API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`OpenAPI-driven API with PostgreSQL integration`);
});

module.exports = app;
