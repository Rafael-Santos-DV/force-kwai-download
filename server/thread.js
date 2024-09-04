import puppeteer from "puppeteer";
import "dotenv/config";
import crypto from "crypto";

process.on("message", async (urls) => {
  const response = await GetUrlsKwai(urls);
  process.send({ done: true, response });
});

async function GetUrlsKwai(urls) {
  // Inicializa o Puppeteer e abre um novo navegador e página
  const browser = await puppeteer.launch({
    // executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--single-process",
      "--no-zygote",
    ],
  });

  // Navega até a página do vídeo com um timeout reduzido

  const map = urls.map(async (url) => {
    const page = await browser.newPage();
    // await page.emulate(iPhone);

    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 300000000,
    });

    return [page, response];
  });

  const promiseAll = [];

  for await (const video of map) {
    promiseAll.push(await video);
  }
  // const promiseAll = await Promise.all(map);

  const videoSelector = "._kwai-player-video_uxc1a_11 video";
  // const videoSelector = "#video-ele";

  const links = [];
  let total = 0;

  for (const [page, response] of promiseAll) {
    try {
      total += 1;
      await page.waitForSelector(videoSelector, { timeout: 300000 });
      const videoSrc = await page.evaluate((selector) => {
        const videoElement = document.querySelector(selector);
        return videoElement ? videoElement.src : null;
      }, videoSelector);

      const name = crypto.randomUUID().slice(0, 6);
      // const nameSecondary =  `${total.toString().padStart(3, "0")}`

      if (videoSrc) {
        console.log("Link do vídeo:", videoSrc);
        links.push({
          name,
          videoSrc,
        });
      } else {
        console.error(
          "Não foi possível encontrar o elemento de vídeo ou o atributo src."
        );
      }
    } catch (err) {
      console.log(err);
    }
  }

  // Espera o elemento de vídeo carregar

  // Extrai o link do vídeo
  // const videoSrc = await page.evaluate((selector) => {
  //   const videoElement = document.querySelector(selector);
  //   return videoElement ? videoElement.src : null;
  // }, videoSelector);

  // if (videoSrc) {
  //   console.log('Link do vídeo:', videoSrc);
  // } else {
  //   console.error('Não foi possível encontrar o elemento de vídeo ou o atributo src.');
  // }

  // // Fecha o navegador
  await browser.close();
  return links;
}
