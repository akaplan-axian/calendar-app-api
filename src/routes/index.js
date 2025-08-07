const express = require('express');
const router = express.Router();

// Root route
router.get('/', (req, res) => {
  res.json({
    message: 'Calendar App API',
    version: '1.0.0',
    status: 'running'
  });
});

module.exports = router;
