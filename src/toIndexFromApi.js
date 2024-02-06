require('dotenv-flow').config();
var request = require("request");
var { google } = require("googleapis");
const database = require('./databaseConnection');
const { itemsDoneToday } = require('./queueStatus');
var key = require(process.env.SECRETS_DESTINATION);

async function indexingApi(urls, callback) {
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ["https://www.googleapis.com/auth/indexing"],
    null
  );
  
  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      return;
    }

  const items = Array.from(urls).map((line) => {
      return {
        "Content-Type": "application/http",
        "Content-ID": "",
        body:
          "POST /v3/urlNotifications:publish HTTP/1.1\n" +
          "Content-Type: application/json\n\n" +
          JSON.stringify({
            url: line[1],
            type: "URL_UPDATED",
          }),
      };
    });

    const options = {
      url: "https://indexing.googleapis.com/batch",
      method: "POST",
      headers: {
        "Content-Type": "multipart/mixed",
      },
      auth: { bearer: tokens.access_token },
      multipart: items,
    };
  
    request(options, (err, resp, body) => {
      callback(body);
    });
  });
}

try {
  database.connection.connect();
} catch (e) {
  console.error(e);
}

async function parseLinks() {
  const itemsDoneTodayCount = await itemsDoneToday();

  if (itemsDoneTodayCount >= process.env.ITEMS_TO_PROCESS_PER_DAY) {
    console.warn('Items to process limit was exceded. Script stopped.');
    process.exit();
  }
  

  const parseData = async () => {
    let links = new Map();
    await new Promise((resolve, reject) => {
      database.connection.query(
        `SELECT * FROM links WHERE parsed_at IS NULL LIMIT ${process.env.ITEMS_TO_PROCESS_IN_ONE_TAKE}`,
        (err, items) => {
          items.forEach((item) => {
            links.set(item.id, item.link);
          });
          resolve(links);
        },
      );
    });  
    
    return links; 
  }


  const links = await parseData();

  const updateLinks = async (links) => {
    const ids = [...links.keys()].join(',');

    await indexingApi(links, console.log)

    database.connection.query(
      `UPDATE links SET parsed_at = NOW() WHERE id IN (${ids})`,
      (err, response) => {
        if (err) console.error(err);
      }
    );
  }

  await updateLinks(links);
  return links.size;
}


module.exports = { parseLinks };