import { Browser, Page } from 'puppeteer';
import * as puppeteer from 'puppeteer';

const width       = 1280;
const height      = 720;
const url = "https://www.youtube.com/watch?v=uvtXYHERxQs&list=RDuvtXYHERxQs&start_radio=1";
const exportname = "recording.webm";

export
const bootstrap = async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // const Xvfb = require('xvfb');
  // const xvfb = new Xvfb({silent: true, xvfb_args: ["-screen", "0", `${width}x${height}x24`, "-ac"],});
  // xvfb.startSync()

  const browser: Browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--enable-usermedia-screen-capturing',
      '--allow-http-screen-capture',
      '--auto-select-desktop-capture-source=puppetcam',
      '--load-extension=' + __dirname,
      '--disable-extensions-except=' + __dirname,
      '--disable-infobars',
      '--force-device-scale-factor=1',
      '--no-sandbox',
      // '--start-fullscreen',
      // '--display='+xvfb._display
    ]
  });
  const page: Page = (await browser.pages())[0];

  // @ts-ignore
  await page._client.send('Emulation.clearDeviceMetricsOverride')
  await page.setViewport({width: width, height: height, deviceScaleFactor: 1})

  await page.goto(url, {waitUntil: 'networkidle2'})
  await page.setBypassCSP(true)

  await page.evaluate(filename=>{
    window.postMessage({type: 'SET_EXPORT_PATH', filename: filename}, '*')

  }, exportname)

  await page.waitFor(10000);

  await page.evaluate(filename=>{
    window.postMessage({type: 'REC_STOP'}, '*')
  }, exportname)

  console.log(`Waiting for download to complete`);
  try {
    await page.waitForSelector('html.downloadComplete', { timeout: 5000 })
  }catch (e) {
    console.log(e);
  }
  console.log(`Wait for download Completed`);
  await page.screenshot({path: 'result.png'});
  await browser.close()
  // xvfb.stopSync()
}

bootstrap();