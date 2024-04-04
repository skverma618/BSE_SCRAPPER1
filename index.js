const express = require('express');
const app = express();
const axios = require('axios');
const scrapingbee = require('scrapingbee'); // Importing SPB's SDK


const SCRAPINGBEE_API_KEY = '873Y4RX2Z6DDFX5ZLNJWQP5XAPJ2USMBHAEEH4AZKXNSUDBT1ONWYN3Y761BXOOBECTJK170ED9A9I2E';
const TARGET_URL = 'https://www.bseindia.com/corporates/ann.html'
// const TARGET_URL = 'https://app.scrapingbee.com/api/v1';

app.get('/', (req, res) => {
    res.send('Hello World!');
}
);

const getData = async (url) => {
    try {
        var client = new scrapingbee.ScrapingBeeClient(SCRAPINGBEE_API_KEY); // Initialize the client with your API Key
        var response = await client.get({
            url: url,
            params: {
                'extract_rules': JSON.stringify({
                    "data": {
                        "selector": "#lblann",
                    },
                    "table_json" : {
                        "selector": "#lblann > table",
                        "output": "table_json"
                    }
                }),
                'json_response': 'True',
                // 'js_scenario': {
                //     "instructions": [
                //         { "click": "#ddlPeriod", },
                //         { "fill": ["#ddlPeriod", "AGM/EGM"] },
                //         // { "click": "#btnSubmit" }
                //     ]
                // },
            },
        })

        // console.log(response);
        var decoder = new TextDecoder();
        var text = decoder.decode(response.data); // Decode request content
        return text;
    } catch (error) {
        var decoder = new TextDecoder();
        var text = decoder.decode(error.response.data);
        console.error(text, "error");
    }
}

app.listen(3000, async () => {
    console.log('Server is running on port 3000');

    // const {data} = await axios.get('https://app.scrapingbee.com/api/v1', {
    //     params: {
    //         'api_key': SCRAPINGBEE_API_KEY,
    //         'url': TARGET_URL,
    //         'extract_rules': { "h1": "#lblann" },
    //         // 'js_scenario': '{"instructions": [{ "click": "#buttonId" }]}',
    //     }
    // })

    // console.log(data);

    const data = await getData(TARGET_URL);

    console.log(data);
}
);

