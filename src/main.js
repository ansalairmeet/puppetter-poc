const puppeteer = require('puppeteer');
const url = 'https://www.youtube.com/watch?v=dffci3_IV64';
const source_tab = 'selected-tab';
const width = 1080;
const height = 1080;
const PUPPETEER_CHROME_PATH = "/usr/bin/google-chrome-stable";
const bootstrap = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--enable-usermedia-screen-capturing',
      '--allow-http-screen-capture',
      '--no-sandbox',
      '--auto-select-desktop-capture-source=${source_tab}',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--use-gl=egl',
      '--window-size=${width},${height}',
    ],
    executablePath: PUPPETEER_CHROME_PATH // set chrome app
  });

  const page = await browser.newPage();
  await page.goto( url , {waitUntil: 'networkidle2'});

  const context = browser.defaultBrowserContext();
  context.clearPermissionOverrides();
  context.overridePermissions("https://youtube.com", []) ;// <--- don't know what parameter to use

  let dimension = {
    width: width,
    height: height,
  };

  page.evaluate(async (dimension)=>{

    console.log = async (message) => {
      const logUrl = `http://localhost:5000`;
      await fetch(logUrl + `/log?q=${message}`, {method: 'GET'})
    }

    navigator.webkitGetUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'screen',
          maxWidth: 1080,
          maxHeight: 1080,
          minFrameRate: 30
        },
      }
    }, stream => {
      var chunks=[];
      console.log(` Got Stream `);
      recorder = new MediaRecorder(stream, {
        videoBitsPerSecond: 5000000,
        ignoreMutedMedia: true,
        mimeType: 'video/webm'
      });

      console.log(`MediaRecorder created`);

      recorder.ondataavailable = (event) => {
        console.log(`Recieved event size = ${event.data.size}`)
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        var superBuffer = new Blob(chunks, {
          type: 'video/webm'
        });
        console.log(`SuperBuffer Size = ${superBuffer.size}`);
      }

      recorder.start();
      setTimeout(() => {
        recorder.stop();
        console.log(`Stopping Recording`);
      }, 10000)

    },  error => {
      console.log(`Unable to get user media ${error}`)
    })
    console.log(`Initialized window navigator`);
  });

  await page.waitFor(15000);
  console.log(`Force closing it now`)
  await page.close();
  await browser.close();
}

bootstrap();