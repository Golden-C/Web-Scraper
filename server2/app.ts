import http, { IncomingMessage, Server, ServerResponse } from "http";
import puppeteer from "puppeteer";
import { parse } from "node-html-parser";
import url from "url";

async function processUrl(req: IncomingMessage, res: ServerResponse) {

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  //get url from the params
  const urlObj = new url.URL(req.url as string, `http://${req.headers.host}`);
  const passedUrl = urlObj.searchParams.get("url");

  try {
    if (passedUrl) {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(passedUrl);
      const htmlContent = await page.content();
      const dom = parse(htmlContent);
      const title = dom.querySelector("title").innerText;
      const description = dom
        .querySelector('meta[name="description"]').getAttribute("content");
      const imgUrls: string[] = Array.from(dom.querySelectorAll("img"))
        .map((img) => img.getAttribute("src") || "")
        .filter((url) => String(url).length > 0) as string[];
      await browser.close();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify(
          {
            title,
            description,
            imgUrls,
          })
      );
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ response: "Unable to parse url" }, null, " "));
    }
  } catch(err) {
    console.log(err);
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ response: "Invalid Url." }, null, " "));
  }
}

const server: Server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "GET") {
      processUrl(req, res);
    }
  }
);
const port = 3001;
server.listen(port, ()=> console.log("listening on port",port));
