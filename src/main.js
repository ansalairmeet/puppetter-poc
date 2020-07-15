const { Browser, Page }  = require('puppeteer');
const puppeteer = require('puppeteer');

const width       = 1280;
const height      = 720;
const url = "https://localhost:5000/event/session?t=cca9ae21-7c58-45bf-bf97-09f4994381b3";
const exportname = "recording.webm";

const sleep = ms => new Promise((resolve, reject) => setTimeout(resolve, ms));
const bootstrap = async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // const Xvfb = require('xvfb');
  // const xvfb = new Xvfb({silent: true, xvfb_args: ["-screen", "0", `${width}x${height}x24`, "-ac"],});
  // xvfb.startSync()

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    ignoreHTTPSErrors: true,
    args: [
      '--disable-notifications',
      '--use-fake-ui-for-media-stream',
      '--enable-usermedia-screen-capturing',
      '--allow-http-screen-capture',
      '--auto-select-desktop-capture-source=puppetcam',
      // '--load-extension=' + __dirname,
      // '--disable-extensions-except=' + __dirname,
      '--disable-infobars',
      '--use-fake-ui-for-media-stream',
      '--force-device-scale-factor=1',
      '--no-sandbox'
    ]
  });
  const page = (await browser.pages())[0];

  await page._client.send('Emulation.clearDeviceMetricsOverride')
  await page.setViewport({width: width, height: height, deviceScaleFactor: 1})
  await page.goto(url, {waitUntil: 'networkidle2'})
  await page.setBypassCSP(true);
  await page.waitFor(2000);

  await page.evaluate(async () => {

    const sleep = ms => new Promise((resolve, reject) => setTimeout(resolve, ms));
    await sleep(1000);
    // document.getElementsByClassName('btn btn-primary')[0].click()
    // await sleep(300);
    // document.getElementsByClassName('btn btn-primary invert ml-1')[0].click()
    // await sleep(1000);
    // document.getElementById("name").value = "Puppetter";
    // await sleep(300);
    // document.getElementById("designation").value = "Puppetter";
    // await sleep(300);
    // document.getElementById("company").value = "Puppetter";
    // await sleep(300);
    // document.getElementById("city").value = "Puppetter";
    // await sleep(300);
    // document.getElementById("country").value = "Puppetter";
    // await sleep(300);
    // document.getElementsByClassName("btn btn-primary w-100")[0].click();
    // await sleep(1000);
    // document.getElementsByClassName("btn btn-primary w-100")[0].click();
    // await sleep(7000);
    document.getElementsByClassName('btn btn-primary')[0].click()



  })

  // await page.waitFor(5000);

  // console.log(`Inside the stream downloading`);
/*
  const { streamIds, streams, blob } = await page.evaluate(async (args) => {
    const elements = document.getElementsByTagName("video");
    const streams = [];
    for( const elem of elements){
      streams.push(elem.captureStream());
    }
    const streamIds = streams.map(m => m.id).join(",");
    console.log({streamIds});

    const sleep = ms => new Promise((resolve, reject) => setTimeout(resolve, ms));
    const download = (recordedChunks) => {
      // alert(`Download ${recordedChunks.length} now`)
      const blob = new Blob(recordedChunks, {
        type: 'video/webm'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = url;
      a.download = 'test.webm';
      a.click();
      window.URL.revokeObjectURL(url);
    }

    const recordedChunks = [];
    const handleDataAvailable = (event) => {
      // alert(event.data.size);
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      } else {
        // ...
      }
    }

    const options = {mimeType: 'video/webm'};
    const mediaRecorder = new MediaRecorder(streams[0], options);
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
    await sleep(10000);
    await mediaRecorder.stop();
    await sleep(1000);
    await download(recordedChunks);
    const blob = new Blob(recordedChunks, {
      type: 'video/webm'
    });
    await sleep(3000);
    return {streamIds, streams, blob};

  });
*/

  await page.waitFor(3000000);

  console.log(`Wait for download Completed`);
  await browser.close()
  // xvfb.stopSync()
}

bootstrap();