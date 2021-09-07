"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const node_html_parser_1 = require("node-html-parser");
const url_1 = __importDefault(require("url"));
async function processUrl(req, res) {
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    //get url from the params
    const urlObj = new url_1.default.URL(req.url, `http://${req.headers.host}`);
    const passedUrl = urlObj.searchParams.get("url");
    try {
        if (passedUrl) {
            const browser = await puppeteer_1.default.launch();
            const page = await browser.newPage();
            await page.goto(passedUrl);
            const htmlContent = await page.content();
            const dom = node_html_parser_1.parse(htmlContent);
            const title = dom.querySelector("title").innerText;
            const description = dom
                .querySelector('meta[name="description"]').getAttribute("content");
            const imgUrls = Array.from(dom.querySelectorAll("img"))
                .map((img) => img.getAttribute("src") || "")
                .filter((url) => String(url).length > 0);
            await browser.close();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
                title,
                description,
                imgUrls,
            }));
        }
        else {
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ response: "Unable to parse url" }, null, " "));
        }
    }
    catch (err) {
        console.log(err);
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ response: "Invalid Url." }, null, " "));
    }
}
const server = http_1.default.createServer((req, res) => {
    if (req.method === "GET") {
        processUrl(req, res);
    }
});
const port = 3001;
server.listen(port, () => console.log("listening on port", port));
