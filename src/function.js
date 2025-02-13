var request = require("request");
var { google } = require("googleapis");
require('dotenv-flow').config();
var key = require(process.env.SECRETS_DESTINATION);

async function indexingApi(urls, callback) {
  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ["https://www.googleapis.com/auth/indexing"],
    null
  );
  const batch = urls.split(/\r?\n/g);

  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      return;
    }

    const items = batch.map((line) => {
      return {
        "Content-Type": "application/http",
        "Content-ID": "",
        body:
          "POST /v3/urlNotifications:publish HTTP/1.1\n" +
          "Content-Type: application/json\n\n" +
          JSON.stringify({
            url: line,
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

module.exports = { indexingApi };
