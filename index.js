const https = require("https");
const query = require("querystring");
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const mcache = require('memory-cache');

const port = process.env.PORT || 5000;

app.use(morgan("combined"));
app.use(cors());

/**
 * In memory cache based on this article:
 * https://medium.com/the-node-js-collection/simple-server-side-cache-for-express-js-with-node-js-45ff296ca0f0
 * @param {*} duration 
 */
var cache = (duration) => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url
    let cachedBody = mcache.get(key)
    if (cachedBody) {
      res.send(cachedBody)
      return
    } else {
      res.sendResponse = res.send
      res.send = (body) => {
        mcache.put(key, body, duration * 1000);
        res.sendResponse(body)
      }
      next()
    }
  }
}

app.get("/TimeDateEndpoint*", function(req, res) {
  var timeDateQueryString = req.url.substring("/TimeDateEndpoint".length);
  timeDateQueryString += "&key=";
  timeDateQueryString += process.env.timeDateAPIKey;

  var timeDateUrl =
    "https://api.timezonedb.com/v2.1/get-time-zone" + timeDateQueryString;
  https
    .get(timeDateUrl, resp => {
      let rawData = "";
      resp.on("data", chunk => {
        rawData += chunk;
      });
      resp.on("end", () => {
        try {
          const parsedData = JSON.parse(rawData);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(parsedData));
        } catch (e) {
          console.error(e.message);
        }
      });
    })
    .on("error", function(e) {
      console.log(e.message);
    });
});

app.get("/topHeadlinesEndpoint*", cache(720), function(req, res) {
  var newsQueryString = req.url.substring("/topHeadlinesEndpoint".length);
  newsQueryString += "&apiKey=";
  newsQueryString += process.env.newsAPIKey;

  var newsUrl = "https://newsapi.org/v2/top-headlines" + newsQueryString;
  https
    .get(newsUrl, resp => {
      let rawData = "";
      resp.on("data", chunk => {
        rawData += chunk;
      });
      resp.on("end", () => {
        try {
          const parsedData = JSON.parse(rawData);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "max-age=3600");
          res.end(JSON.stringify(parsedData));
        } catch (e) {
          console.error(e.message);
        }
      });
    })
    .on("error", function(e) {
      console.log(e.message);
    });
});

app.get("/everythingNewsEndpoint*", cache(720), function(req, res) {
  var newsQueryString = req.url.substring("/everythingNewsEndpoint".length);
  newsQueryString += "&apiKey=";
  newsQueryString += process.env.newsAPIKey;

  var newsUrl = "https://newsapi.org/v2/everything" + newsQueryString;
  https
    .get(newsUrl, resp => {
      let rawData = "";
      resp.on("data", chunk => {
        rawData += chunk;
      });
      resp.on("end", () => {
        try {
          const parsedData = JSON.parse(rawData);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "max-age=3600");
          res.end(JSON.stringify(parsedData));
        } catch (e) {
          console.error(e.message);
        }
      });
    })
    .on("error", function(e) {
      console.log(e.message);
    });
});

app.get("/weatherEndpoint*", cache(360), function(req, res) {
  var wheatherQueryString = req.url.substring("/weatherEndpoint".length);
  wheatherQueryString += "&appid=";
  wheatherQueryString += process.env.weatherAPIKey;

  var weatherUrl =
    "https://api.openweathermap.org/data/2.5/weather" + wheatherQueryString;
  https
    .get(weatherUrl, resp => {
      let rawData = "";
      resp.on("data", chunk => {
        rawData += chunk;
      });
      resp.on("end", () => {
        try {
          const parsedData = JSON.parse(rawData);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "max-age=3600");
          res.end(JSON.stringify(parsedData));
        } catch (e) {
          console.error(e.message);
        }
      });
    })
    .on("error", function(e) {
      console.log(e.message);
    });
});

app.get("/forecastEndpoint*", cache(360), function(req, res) {
  var wheatherQueryString = req.url.substring("/forecastEndpoint".length);
  wheatherQueryString += "&appid=";
  wheatherQueryString += process.env.weatherAPIKey;

  var weatherUrl =
    "https://api.openweathermap.org/data/2.5/forecast" + wheatherQueryString;
  https
    .get(weatherUrl, resp => {
      let rawData = "";
      resp.on("data", chunk => {
        rawData += chunk;
      });
      resp.on("end", () => {
        try {
          const parsedData = JSON.parse(rawData);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "max-age=21600");
          res.end(JSON.stringify(parsedData));
        } catch (e) {
          console.error(e.message);
        }
      });
    })
    .on("error", function(e) {
      console.log(e.message);
    });
});

app.get("/webcamEndpoint*", cache(10080), function(req, res) {
  var queryParams = query.parse(req.url.substring("/webcamEndpoint?".length));

  if (queryParams["countryCode"] === "ma" || "cn" || "in") {
    var api =
      "/webcams/list/country=" +
      queryParams["countryCode"] +
      "/orderby=random?show=webcams%3Aimage%2Clocation&amp;lang=en";
  } else {
    var api =
      "/webcams/list/nearby=" +
      queryParams["lat"] +
      "," +
      queryParams["lon"] +
      ",50/orderby=random/limit=1?show=webcams%3Aimage%2Clocation&amp;lang=en";
  }

  var options = {
    host: "webcamstravel.p.rapidapi.com",
    port: 443,
    path: api,
    method: "GET",
    headers: {
      "X-Rapidapi-Key": process.env.webCamAPIKey,
      "X-Rapidapi-Host": "webcamstravel.p.rapidapi.com"
    }
  };

  https
    .get(options, resp => {
      let rawData = "";
      resp.on("data", chunk => {
        rawData += chunk;
      });
      resp.on("end", () => {
        try {
          const parsedData = JSON.parse(rawData);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(parsedData));
        } catch (e) {
          console.error(e.message);
        }
      });
    })
    .on("error", function(e) {
      console.log(e.message);
    });
});

app.get("/picturesEndpoint*", cache(720), function(req, res) {
  var picturesQueryString = req.url.substring("/picturesEndpoint".length);
  picturesQueryString += "&client_id=";
  picturesQueryString += process.env.unsplashAPIKey;

  var pictureUrl =
    "https://api.unsplash.com/search/photos" + picturesQueryString;
  https
    .get(pictureUrl, resp => {
      let rawData = "";
      resp.on("data", chunk => {
        rawData += chunk;
      });
      resp.on("end", () => {
        try {
          const parsedData = JSON.parse(rawData);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(parsedData));
        } catch (e) {
          console.error(e.message);
        }
      });
    })
    .on("error", function(e) {
      console.log(e.message);
    });
});

app.listen(port, function() {
  console.log("Listening on port 80");
});
