const app = require("express")();

let chrome = {};
let puppeteer;

if (process.env.IS_VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
  let options = {};

  if (process.env.IS_VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    let browser = await puppeteer.launch(options);

    let page = await browser.newPage();
    await page.goto("https://www.google.com");
    res.send(await page.title());

    await browser.close(); // Don't forget to close the browser!
  } catch (err) {
    console.error(err);
    res.status(500).send("Error occurred while launching Puppeteer.");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
