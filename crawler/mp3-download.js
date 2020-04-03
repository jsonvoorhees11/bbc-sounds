const puppeteer = require('puppeteer');
const fs = require('fs');

const filePath = './urls.json';
const programmeUrl = 'https://www.bbc.co.uk/programmes/';
const mp3LinkXPath = '#download-popup-holder > div > ul > li:nth-child(1) > a'

const run = () => {
    const data = fs.readFileSync(filePath,'UTF-8');
    const trackList = Array.from(JSON.parse(data));
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (request.resourceType() === 'document') {
            request.continue();
        } else {
            request.abort();
        }
    });

    trackList.forEach(t => {
        const dirPath = `./${t}`;
        if(!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath);
        }
        Array.from(t.tracks).forEach(x=>{
            if(fs.existsSync(`${dirPath}/${x}.mp3`)) {
                return;
            }
            await page.goto(`${programmeUrl}/${x}`);
            const mp3Link = await page.evaluate((mp3LinkXPath) => {
                const urlNode = document.querySelector(mp3LinkXPath);
                if (urlNode) {
                    return urlNode.getAttribute('href');
                }
            },mp3LinkXPath);
            
        })
    })
}

run();