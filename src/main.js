const { Browser, Page }  = require('puppeteer');
const puppeteer = require('puppeteer');

const width       = 1280;
const height      = 720;
// const url = "https://test2.airmeet.com/event/session?t=8b3ee172-eb48-40e4-a1ac-e5209f588d88";
const url = "https://test12.airmeet.com/event/session?t=29728e39-b1f8-466a-b61b-2a26630e7bc5";

const bootstrap = async () => {

  const browser = await puppeteer.connect({ browserWSEndpoint: 'ws://localhost:8000' });
  const page = (await browser.pages())[0];
  await page._client.send('Emulation.clearDeviceMetricsOverride')
  await page.setViewport({width: width, height: height, deviceScaleFactor: 1})
  await page.goto(url, {waitUntil: 'networkidle2'})
  await page.setBypassCSP(true);
  await page.waitFor(2000);
  await page.evaluate(async () => {
    const sleep = ms => new Promise((resolve, reject) => setTimeout(resolve, ms));
    await sleep(1000);
    // while(true) {
    //   try {
        document.getElementsByClassName('btn btn-primary')[0].click()
        // break;
      // }catch (e) {
      //   await sleep(1000);
      // }
    // }
    console.log("<<<<<<<<<<<<<<");
    console.log(window.airmeet);
  })

  await page.waitFor(3000000);

  console.log(`Wait for download Completed`);
  await browser.close()
  // xvfb.stopSync()
}

bootstrap();
