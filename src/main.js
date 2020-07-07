const puppeteer = require('puppeteer');
const Xvfb = require('xvfb');

const url = 'https://www.youtube.com/watch?v=dffci3_IV64';
const source_tab = 'selected-tab';
const width = 1080;
const height = 1080;
const PUPPETEER_CHROME_PATH = '/usr/bin/google-chrome-stable';
const bootstrap = async () => {

  const xvfb = new Xvfb({silent: true, xvfb_args: ["-screen", "0", `${width}x${height}x24`, "-ac"],});
  xvfb.startSync()

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
        '--start-fullscreen',
        '--display='+xvfb._display
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
      const logUrl = `http://localhost:5000`;

      console.log = async (message) => {
        await fetch(logUrl + `/log?q=${message}`, { method: 'GET' });
      };

      const uploadBlob = async (blobData) => {
        const fd = new FormData();
        fd.append('upl', blobData, 'blobby.webm');
        await fetch(`${logUrl}/upload`,
          {
            method: 'post',
            body: fd,
          }).then((response) => {
            console.log('Upload done');
          return response;
        })
          .catch((err) => {
            console.log(`Upload Error = ${err}`);
          });
      };

      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: true,
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
      recorder.onstop = async () => {
        const superBuffer = new Blob(chunks, {
          type: 'video/webm',
        });
        console.log(`SuperBuffer Size = ${superBuffer.size}`);
        console.log(`Uploading to server blob`)
        await uploadBlob(superBuffer);
      };
      recorder.start();
      setTimeout(() => {
        recorder.stop();
        console.log(`Stopping Recording & uploading `);

      }, 60000);

    });

    console.log(`Initialized window navigator success`);
  } catch (e) {
    console.log(`Exception occurred with initialization ${e}`);

  }

  await page.waitFor(80000);
  console.log(`Force closing it now`);
  await page.close();
  await browser.close();
  xvfb.stopSync()

};

bootstrap();