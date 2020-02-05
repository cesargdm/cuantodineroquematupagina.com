const Koa = require("koa");
const puppeteer = require("puppeteer");
const Router = require("@koa/router");
const compress = require("koa-compress");
const serve = require("koa-static");

const app = new Koa();
const router = new Router();

function formatBytes(a, b) {
  if (0 == a) return "0 Bytes";
  var c = 1024,
    d = b || 2,
    e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    f = Math.floor(Math.log(a) / Math.log(c));
  return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
}

const cache = {};

router.get("/api/site-size", async ctx => {
  const { url } = ctx.request.query;

  if (cache[url]) {
    ctx.body = cache[url];
    return;
  }

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    args: ["--disable-dev-shm-usage"]
  });
  const page = await browser.newPage();

  let total = 0;
  page._client.on("Network.loadingFinished", data => {
    total += data.encodedDataLength;
  });

  await page.goto(url);

  await browser.close();

  cache[url] = { bytes: total, formatted: formatBytes(total) };

  ctx.body = { bytes: total, formatted: formatBytes(total) };
});

app
  .use(compress())
  .use(serve("./build", { gzip: true }))
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(8080);
