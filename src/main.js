const puppeteer = require('puppeteer');
const url = 'https://www.youtube.com/watch?v=dffci3_IV64';
const source_tab = 'selected-tab';
const width = 1080;
const height = 1080;
const PUPPETEER_CHROME_PATH = '/usr/bin/google-chrome-stable';
const bootstrap = async () => {
  const browser = await puppeteer
    .launch({
      headless: false,
      defaultViewport: null,
      args: [
        '--enable-usermedia-screen-capturing',
        '--allow-http-screen-capture',
        '--auto-select-desktop-capture-source=pickme',
        '--enable-experimental-web-platform-features',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--use-gl=egl',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--start-maximized',
      ],
    });

  const page = await browser.newPage();
  page.setViewport({
    height: 1920,
    width: 1080,
  });

  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitFor(2000);

  try {
    await page.evaluate(async () => {
      document.title = 'pickme';

      console.log = async (message) => {
        const logUrl = `http://localhost:5000`;
        await fetch(logUrl + `/log?q=${message}`, { method: 'GET' });
      };

      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
        video: true,
      });
      const recorder = new MediaRecorder(stream, {
        videoBitsPerSecond: 5000000,
        ignoreMutedMedia: true,
        mimeType: 'video/webm',
      });
      const chunks = [];
      recorder.ondataavailable = (event) => {
        console.log(`Recieved event size = ${event.data.size}`);
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      recorder.onstop = () => {
        const superBuffer = new Blob(chunks, {
          type: 'video/webm',
        });
        console.log(`SuperBuffer Size = ${superBuffer.size}`);
      };
      recorder.start();
      setTimeout(() => {
        recorder.stop();
        console.log(`Stopping Recording`);
      }, 10000);

    });

    console.log(`Initialized window navigator success`);
  } catch (e) {
    console.log(`Exception occurred with initialization ${e}`);

  }

  await page.waitFor(15000);
  console.log(`Force closing it now`);
  await page.close();
  await browser.close();
};

bootstrap();