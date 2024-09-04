const axios = require('axios');
const fs = require('fs');
const path = require('path');

const videoUrl = 'https://aws-br-cdn.kwai.net/upic/2021/04/27/03/BMjAyMTA0MjcwMzU5NDNfMTUwMDAwMTI0MzQzODgyXzE1MDA1MDAzNTcwMTQxNF8xXzM=_b_B08e024d1a0c5b11e17a9d64628b77c01.mp4?tt=b&clientCacheKey=5cf3495756a16285782ff9726062f88f&tag=1-1721498535-unknown-0-p3ddk7japr-4a72f7644486e00b';
const videoPath = path.resolve(__dirname, 'video.mp4');

async function downloadVideo() {
  const response = await axios({
    url: videoUrl,
    method: 'GET',
    responseType: 'stream',
  });

  const writer = fs.createWriteStream(videoPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function processVideo() {
  try {
    console.log('Downloading video...');
    await downloadVideo();
    console.log('Download completed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

processVideo();
