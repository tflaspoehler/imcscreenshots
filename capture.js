const fs = require("fs");
const puppeteer = require("puppeteer");
const pages = require("./americasmart.json");

const fetch = require('node-fetch');
let url = "https://spreadsheets.google.com/feeds/cells/10V9Bk9hb5eIV7vDtBMYCmvLqqga0Xtp6S93VAu6DX7o/1/public/full?alt=json";
let settings = { method: "Get" };




async function captureMultipleScreenshots(feed) {
  if (!fs.existsSync("screenshots")) {
    fs.mkdirSync("screenshots");
  }

  let browser = null;



        try {
          // launch headless Chromium browser
          browser = await puppeteer.launch({
            headless: true,
          });
          // create new page object
          const page = await browser.newPage();
      
          // set viewport width and height
          await page.setViewport({
            width: 1440,
            height: 1080,
          });
      
          for (const { name, id, url, market } of feed) {


            if (!fs.existsSync(`screenshots/${market}`)) {
                fs.mkdirSync(`screenshots/${market}`);
            }

            await page.goto(url);
            console.log(name, id, url, market);
            let div_selector_to_remove= ".gdpr-banner-wrapper";
              await page.evaluate((sel) => {
                  var elements = document.querySelectorAll(sel);
                  for(var i=0; i< elements.length; i++){
                      elements[i].parentNode.removeChild(elements[i]);
                  }
              }, div_selector_to_remove)
            await page.screenshot({ path: `screenshots/${market}/${id}.jpeg`, fullPage: true });
            console.log(`✅ ${name} - (${url})`);
          }
        } catch (err) {
          console.log(`❌ Error: ${err.message}`);
        } finally {
          if (browser) {
            await browser.close();
          }
          console.log(`\n🎉 ${pages.length} screenshots captured.`);
        }

}



fetch(url, settings)
.then(res => res.json())
.then((json) => {
    // do something with JSON
    let feed = json.feed.entry.map(page => {
        let text = page.content["$t"].replace('https://www.','https://');
        let market = text.split("https://")[1].split(".com")[0];
        let name = (text.split(".com/")[1] == '') ? 'Home' : text.split(".com/")[1].split("/").join('.');
        return {
            id: name,
            name: name,
            url: text,
            market: market
        };
    });
    captureMultipleScreenshots(feed);
});
