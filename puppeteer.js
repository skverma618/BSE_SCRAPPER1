const puppeteer = require('puppeteer');

(async () => {
    // Launch the browser
    const browser = await puppeteer.launch({
        headless: false,
    });

    // Open a new page
    const page = await browser.newPage();

    // Navigate to the website
    await page.goto('https://www.bseindia.com/corporates/ann.html');

    // Fill input field
    await page.select('#ddlPeriod', 'Company Update');

    // Submit the form
    await page.click('#btnSubmit');

    console.log('Form submitted, waiting for result...');

    let hasNextPage = true;
    let result = [];

    while (hasNextPage) {
        // Wait for result to appear
        await page.waitForSelector('#lblann > table > tbody > tr:nth-child(4)');

        console.log('Result appeared, extracting data...');

        // Extract information from the table
        const pageResult = await page.evaluate(() => {
            const tableRows = document.querySelectorAll('#lblann > table > tbody > tr:nth-child(4) td table');
            const data = [];

            tableRows.forEach(row => {
                // Example: Get text content of the first cell in each row
                const firstCellText = row.querySelector('td:first-child').textContent;

                // Example: Get text content of the second cell in each row
                const secondCellText = row.querySelector('td:nth-child(2)').textContent;

                const pdf = row.querySelector('td:nth-child(4)')?.getAttribute('href')

                // Example: Construct an object with the extracted data
                const rowData = {
                    title: firstCellText,
                    description: secondCellText,
                    // pdfLink: pdf
                };

                data.push(rowData);
            });

            return data;
        });

        result = result.concat(pageResult);

        // Check if there's a next page
        hasNextPage = await page.evaluate(() => {
            const nextPageButton = document.querySelector('#idnext');
            
            return nextPageButton !== null && !nextPageButton.disabled;
        });

        // If there's a next page, click on the "Next" button
        if (hasNextPage) {
            await page.click('#idnext');
            console.log('Navigating to next page...');
            // Wait for the page to load
            await page.waitForNavigation();
        }
    }

    console.log('Data extracted:', result);

    // Close the browser
    await browser.close();
})();
