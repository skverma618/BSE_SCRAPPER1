const Parser = require('rss-parser');
const parser = new Parser();
const fs = require('fs');
const path = require('path');

const currentDate = new Date().toISOString().replace(/:/g, '-'); // Get current date and time as a string

async function rssFeedwithKeyword(keyword) {
    try {
        const feed = await parser.parseURL('https://news.google.com/rss/search?q=indian%20stock%20market&hl=en-IN&gl=IN&ceid=IN:en');

        console.log(`Title: ${feed.title}`);
        console.log(`Link: ${feed.link}`);
        console.log('--------------------------');
        feed.items.forEach((item, index) => {
            console.log(`${index + 1}. ${item.title}`);
            console.log(`   Published on: ${item.pubDate}`);
            console.log(`   Link: ${item.link}`);
            console.log('--------------------------');
        });

        fs.writeFileSync(filePath, JSON.stringify(feed, null, 2));

    } catch (error) {
        console.error('Error fetching or parsing RSS feed:', error);
    }
}

async function getLatestNews(feedUrls) {
    try {
        const directoryPath = path.join(__dirname, 'rss_feed_' + currentDate); // Construct directory path
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath); // Create directory if it doesn't exist
        }
        for (let i = 0; i < feedUrls.length; i++) {
            const fileName = `rss_feed_${i+1}.json`;
            const filePath = path.join(directoryPath, fileName); // Construct file path

            let feedUrl = feedUrls[i];
            feedUrl = encodeURI(feedUrl);
            const feed = await parser.parseURL(feedUrl);

            console.log(`Title: ${feed.title}`);
            console.log(feed)

            fs.writeFileSync(filePath, JSON.stringify(feed, null, 2));

            // return feed.items.map(item => ({
            //     title: item.title,
            //     link: item.link,
            //     date: item.isoDate,
            //     description: item.contentSnippet
            // }));
        }
    } catch (error) {
        console.error('Error fetching latest news:', error);
        return [];
    }
}

// Function to get data from a website with specific keyword(s)
async function getDataWithKeyword(feedUrl, keywords) {
    try {
        const feed = await parser.parseURL(feedUrl);
        const filteredItems = feed.items.filter(item =>
            keywords.some(keyword => item.title.toLowerCase().includes(keyword.toLowerCase()))
        );

        console.log(filteredItems)

        return filteredItems.map(item => ({
            title: item.title,
            link: item.link,
            date: item.isoDate,
            description: item.contentSnippet
        }));
    } catch (error) {
        console.error('Error fetching latest news:', error);
        console.error('XML Content:', error.xml);
        return [];
    }
}

// getStockMarketNews("indian stock market");
getLatestNews(['https://www.moneycontrol.com/rss/MCtopnews.xml', 'https://www.moneycontrol.com/rss/marketreports.xml', 'https://www.livemint.com/rss/markets', 'https://www.business-standard.com/rss/home_page_top_stories.rss'])
// getDataWithKeyword('https://www.livemint.com/rss/companies', 'DGCA')
