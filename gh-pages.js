var ghpages = require("gh-pages");

ghpages.publish("./public", (e) => console.log(e));
