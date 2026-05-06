const express = require('express');
const path = require('path');
const app = express();
const port = 8080;

// 빌드된 정적 파일 위치 설정
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend serving at http://localhost:${port}`);
});
