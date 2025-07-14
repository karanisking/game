// server.js
const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Script is running in background');
});

// Start your script
const child = exec('node index.js');

child.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
