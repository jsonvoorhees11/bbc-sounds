const puppeteer = require('puppeteer');
const fs = require('fs');
const podcastsUrl = 'https://www.bbc.co.uk/sounds/category/podcasts?';
const trackPlayUrl = 'https://www.bbc.co.uk/sounds/play/';
const brandUrl = 'https://www.bbc.co.uk/sounds/brand/';
const baseUrl = 'https://www.bbc.co.uk';
const programmeUrl = 'https://www.bbc.co.uk/programmes/';

const trackUrlXPath = `#main > div > div > div > div.gs-u-box-size.sw-qa-container-list > div > ul > li > article > a`;
const brandUrlXPath = 
`#main > div > div > div.gel-wrap.gs-u-box-size.gs-u-mt-alt\\+ > div > div.gel-1\\/1.gel-3\\/4\\@m.gel-1\\/2\\@xxl 
> div.gs-u-box-size.gs-u-mt\\+.gs-u-align-center.play-u-align-left\\@m.metadata-links 
> div.gs-u-display-block.gs-u-display-inline-block\\@m.gs-u-pv\\+.gs-u-p0\\@m.gs-u-mr\\+\\+\\@m.metadata-links__link > a`;
const downloadUrlXPath = '#download-popup-holder > div > ul > li:nth-child(1) > a';

const run = (pagesToScrape) => {
    return new Promise(async(resolve, reject)=> {
        try {
            if (!pagesToScrape) {
                pagesToScrape = 1;
            }
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
            let currentPage = 1;
            let urls = [];
            while (currentPage <= pagesToScrape) {
                await page.goto(`${podcastsUrl}page=${currentPage}&sort=popular`);
                let newUrls = await page.evaluate((trackUrlXPath)=>{
                    let result = [];
                    let items = document.querySelectorAll(trackUrlXPath)
                    items.forEach(item => {
                        const trackUrl = item.getAttribute('href');
                        result.push(
                            trackUrl
                        )
                    });
                    return result;
                },trackUrlXPath);
                urls = urls.concat(newUrls);
                currentPage++;
            }

            console.log("popular track urls: ", urls)
            let brandUrls = []
            for (url of urls) {
                const urlParts = Array.from(url.split('/'));
                const trackId = urlParts[urlParts.length-1];
                await page.goto(`${trackPlayUrl+trackId}`);
                let brandUrl = await page.evaluate((brandUrlXPath)=> {
                    let urlNode = document.querySelector(brandUrlXPath);
                    if (urlNode) {
                        return urlNode.getAttribute('href');
                    }
                },brandUrlXPath);
                if (!brandUrls.some(x=>x===brandUrl)){
                    brandUrls.push(brandUrl);
                }
            }
            console.log("brandUrls: ", brandUrls);

            let brandWithTracks = [];
            for(url of brandUrls.filter(x=>x)) {
                const parts = Array.from(url.split('/'));
                const id = parts[parts.length-1];
                let brandData= {id:id,tracks:[]}
                await page.goto(`${baseUrl+url}`);
                let newUrls = await page.evaluate((trackUrlXPath)=>{
                    const trackNodes = document.querySelectorAll(trackUrlXPath);
                    let urls = [];
                    trackNodes.forEach(track => {
                        const trackUrl = track.getAttribute('href');
                        urls.push({url:trackUrl});
                    });
                    return urls;
                },trackUrlXPath);
                brandData.tracks = newUrls;
                brandWithTracks.push(brandData);
            }
            for(brand of brandWithTracks) {
                const tracks = brand.tracks;
                for (track of tracks) {
                    const url = track.url;
                    const parts = Array.from(url.split('/'));
                    const id = parts[parts.length-1];
                    console.log('programme url: ',`${programmeUrl+id}`);
                    await page.goto(`${programmeUrl+id}`);
                    let downloadLink = await page.evaluate((downloadUrlXPath)=> {
                        const linkNode = document.querySelector(downloadUrlXPath);
                        if (!linkNode) {
                            return;
                        }
                        const downloadLink = linkNode.getAttribute('href');
                        return downloadLink;
                    },downloadUrlXPath);
                    track.downloadLink = downloadLink;
                }
            }
            
            browser.close();
            return resolve(brandWithTracks);
        }
        catch (e) {
            return reject(e)
        }
    })
}

const saveToFile = (path, data) => {
    fs.writeFile(path, data, function (err) {
        if (err) return console.log(err);
        console.log("DONE.")
    });
}

run(6)
.then(res => JSON.stringify(res)).then(data=>saveToFile('./urls.json',data)) .catch(console.error);
// 