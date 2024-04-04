const axios = require("axios");

const apiUrl = "https://api.webscrapingapi.com/v1";
const apiKey = "ft2y2MHueSbjMrdgCTx4Z6eKI1HrPA1m";
const url = "https://www.bseindia.com/corporates/ann.html";

const extractRules = {
    "data": {
        "selector": "#lblann > table > tbody > tr:nth-child(4) td table"
    }
};

const jsInstructions = [
    {"action": "value", "selector": "#ddlPeriod", "value": "Company Update", "strict": "false"},
    {"action": "click", "selector": "#btnSubmit", "timeout": 4000, "strict": "false"}
];

const requestData = {
    api_key: apiKey,
    url: encodeURIComponent(url),
    render_js: 1,
    proxy_type: "datacenter",
    wait_until: "networkidle0",
    timeout: 60000,
    extract_rules: JSON.stringify(extractRules),
    js_instructions: JSON.stringify(jsInstructions),
    json_response: 1,
};

axios.get(apiUrl, { params: requestData })
    .then(response => {
        console.log(response.data);
    })
    .catch(error => {
        console.error("Error:", error);
    });
