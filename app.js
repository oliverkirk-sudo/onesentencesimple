const express = require('express');
const https = require('https');
const cors = require('cors');

const app = express();

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || origin !== 'https://itechfans.com') {
//       callback(new Error('Not allowed by CORS'));
//       return;
//     }
//     callback(null, true);
//   }
// };

app.use(cors());
const port = 3000;

let sentences = [];
let filesToDownload = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
let filesDownloaded = 0;

filesToDownload.forEach(file => {
  const url = `https://fastly.jsdelivr.net/gh/hitokoto-osc/sentences-bundle@master/sentences/${file}.json`;

  https.get(url, (apiRes) => {
    let data = '';

    if (apiRes.statusCode === 404) {
      console.log(`File ${file}.json not found. Skipping.`);
      filesDownloaded++;
      checkAllFilesDownloaded();
      return;
    }

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      const parsedData = JSON.parse(data);
      sentences = sentences.concat(parsedData);
      filesDownloaded++;

      console.log(`File ${file}.json downloaded and processed.`);
      checkAllFilesDownloaded();
    });

  }).on('error', (err) => {
    console.log('Error: ', err.message);
  });
});

function checkAllFilesDownloaded() {
  if(filesDownloaded === filesToDownload.length) {
    console.log('All files processed. Server is ready!');
  }
}
app.use((err, req, res, next) => {
  console.error(err.stack); // 将错误信息记录在服务器的日志中

  // 检查错误的状态码，如果不存在则默认为 500
  const statusCode = err.status || 500;
  
  // 返回一个通用的错误消息
  res.status(statusCode).json({ 
    status: 'error',
    message: 'An unexpected error occurred'
  });
});
app.get('/', (req, res) => {
  if (sentences.length === 0) {
    res.status(500).send('Sentences not loaded yet. Try again later.');
    return;
  }

  const randomIndex = Math.floor(Math.random() * sentences.length);
  res.json(sentences[randomIndex]);
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
