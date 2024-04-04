const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const dotenv = require("dotenv");
// const bseScrapper = require("./bseScrapper");

dotenv.config();

const currentDate = new Date().toISOString().replace(/:/g, '-'); // Get current date and time as a string
const fileName = `scraped_data_${currentDate}.json`; // Construct file name


const directoryPath = path.join(__dirname, 'scraped_results'); // Construct directory path
if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath); // Create directory if it doesn't exist
}

const filePath = path.join(directoryPath, fileName); // Construct file path

class TaskRunner {
    browser;
    page;
    platform;
    constructor(platformName) {
        switch (platformName) {
            case "bse":
                this.platform = new bseScrapper();
                break;
            case "moneyControl":
                this.platform = new moneyControl();
                break;
            default:
                throw new Error(`Unsupported platform: ${platformName}`);
        }
    }

    async init(proxy) {
        this.browser = await puppeteer.launch({
            // executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
            defaultViewport: { width: 1920, height: 1080 },
            headless: false,
        });

        this.browser.on("disconnected", () => {
            console.log("Browser disconnected");
        });

        this.page = await this.browser.newPage();
        this.page.setDefaultNavigationTimeout(0);

        // Pass the page instance to the platform
        await this.platform.setBrowser(this.browser);
        await this.platform.setPage(this.page);
    }

    async getData() {
        return await this.platform.getData();
    }

    async close() {
        console.log("Closing browser...");
        await this.browser.close();
    }
}

class bseScrapper {
    page;
    browser;

    async setBrowser(browser) {
        this.browser = browser;
    }

    async setPage(page) {
        this.page = page;
    }

    async getData() {
        if (!this.browser) {
            throw new Error('Browser not initialized. Call launchBrowser() first.');
        }

        await this.page.goto('https://www.bseindia.com/corporates/ann.html');

        await this.page.select('#ddlPeriod', 'Company Update');

        await this.page.click('#btnSubmit');

        console.log('Form submitted, waiting for result...');

        let hasNextPage = true;
        let result = [];

        while (hasNextPage) {
            await this.page.waitForSelector('#lblann > table > tbody > tr:nth-child(4)');

            console.log('Result appeared, extracting data...');

            const pageResult = await this.page.evaluate(async () => {
                const tableRows = document.querySelectorAll('#lblann > table > tbody > tr:nth-child(4) td table:nth-child(1)');
                const data = [];

                for (let i = 0; i < tableRows.length; i++) {
                    const row = tableRows[i];
                    const firstCellText = row.querySelector('tbody > tr:nth-child(1) > td:nth-child(1)').textContent;
                    const secondCellText = row.querySelector('tbody > tr:nth-child(1) > td:nth-child(2)').textContent;
                    const pdf = row.querySelector('tbody > tr:nth-child(1) > td:nth-child(4) a');

                    // let prodLink = await row.$('td:nth-child(4) a');
                    // console.log("Product Link", prodLink);
                    // let productUrl = await (await prodLink.getProperty("href")).jsonValue();

                    const rowData = {
                        title: firstCellText.replace(/\n\s+/g, ''), // Remove newlines and multiple spaces
                        description: secondCellText,
                        // pdfLink: pdf
                    };
            
                    // const rowData = {
                    //     title: firstCellText,
                    //     description: secondCellText,
                    //     // pdfLink: pdf
                    // };

                    data.push(rowData);
                };

                return data;
            });

            result = result.concat(pageResult);

            hasNextPage = await this.page.evaluate(() => {
                const nextPageButton = document.querySelector('#idnext');
                return nextPageButton !== null && !nextPageButton.disabled;
            });

            if (hasNextPage) {
                await this.page.click('#idnext');
                console.log('Navigating to next page...');
            }
        }

        console.log('Data extracted:', result.length);
        console.log(result);

        // Write result to the file
        fs.writeFileSync(filePath, JSON.stringify(result, null, 2));

        await this.page.close();
    }
}

class moneyControl {
    page;
    browser;

    async setBrowser(browser) {
        this.browser = browser;
    }

    async setPage(page) {
        this.page = page;
    }

    async getData() {
        if (!this.browser) {
            throw new Error('Browser not initialized. Call launchBrowser() first.');
        }

        await this.page.goto('https://www.moneycontrol.com/');

        await this.page.select('#ddlPeriod', 'Company Update');

        await this.page.click('#btnSubmit');

        console.log('Form submitted, waiting for result...');

        let hasNextPage = true;
        let result = [];

        while (hasNextPage) {
            await this.page.waitForSelector('#lblann > table > tbody > tr:nth-child(4)');

            console.log('Result appeared, extracting data...');

            const pageResult = await this.page.evaluate(() => {
                const tableRows = document.querySelectorAll('#lblann > table > tbody > tr:nth-child(4) td table');
                const data = [];

                for (let i = 0; i < tableRows.length; i++) {
                    const row = tableRows[i];
                    const firstCellText = row.querySelector('td:first-child').textContent;
                    const secondCellText = row.querySelector('td:nth-child(2)').textContent;
                    const pdf = row.querySelector('td:nth-child(4) a');

                    const rowData = {
                        title: firstCellText,
                        description: secondCellText,
                        pdfLink: pdf
                    };

                    data.push(rowData);
                }

                return data;

            });

            result = result.concat(pageResult);

            hasNextPage = await this.page.evaluate(() => {
                const nextPageButton = document.querySelector('#idnext');
                return nextPageButton !== null && !nextPageButton.disabled;
            }

            );

            if (hasNextPage) {
                await this.page.click('#idnext');
                console.log('Navigating to next page...');
            }
        }

        console.log('Data extracted:', result.length);
        console.log(result[result.length - 1]);
    }
}

const scraper = new TaskRunner("bse");

(async () => {
    await scraper.init();
    const data = await scraper.getData();
    // console.log(data);
    await scraper.close();
})();
