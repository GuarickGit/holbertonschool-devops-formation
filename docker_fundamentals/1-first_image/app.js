const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const GREETING = process.env.GREETING || 'Hello from inside a container!';

app.get('/', (req, res) => {
  res.send(`${GREETING}\n`);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT} — greeting: ${GREETING}`);
});
