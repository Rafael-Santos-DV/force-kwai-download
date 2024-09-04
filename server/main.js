import Express from "express";
import cors from "cors";
import "dotenv/config";
import child_process from "node:child_process";

import path from "node:path";

// const urls = ['https://www.kwai.com/@lorenaeestevao040/video/5250221373246074281', 'https://www.kwai.com/@Dacostagab/video/5252754598425194082', 'https://www.kwai.com/@biel.pv/video/5227421897948479111'];

const App = Express();

// Serve os arquivos estáticos da pasta "public"
App.use(Express.static(path.join(process.cwd(), "static")));

App.use(cors());

App.use(Express.json()); // for parsing application/json
// App.use(Express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

App.post("/urls-kwai", async (request, response) => {
  console.log("seconds: ", console.time());
  const data = [];
  const urls = request.body;
  console.log("TOTAL: ", urls.length);

  const arrayOfLinks = dividirArray(urls, 10);
  for (const link of arrayOfLinks) {
    const worker = child_process.fork(
      path.join(process.cwd(), "server", "thread.js")
    );
    const value = await new Promise((resolve, reject) => {
      worker.send(link);

      worker.on("message", (responseMessage) => {
        if (responseMessage.done) {
          resolve(responseMessage.response);
        }
      });

      worker.on("error", (error) => {
        reject(error);
      });
    });

    data.push(...value);
  }

  // response.setHeader('Access-Control-Allow-Origin', '*');
  // response.setHeader('Access-Control-Request-Method', '*');
  console.log("seconds: ", console.timeEnd());
  console.log("== END ==");
  return response.json(data);
});

App.listen(3000, () =>
  console.log(`
  WEB: http:localhost:3000/
  `)
);

function dividirArray(array, tamanhoParte) {
  let resultado = [];
  for (let i = 0; i < array.length; i += tamanhoParte) {
    resultado.push(array.slice(i, i + tamanhoParte));
  }
  return resultado;
}
