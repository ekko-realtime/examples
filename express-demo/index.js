const express = require("express");
const app = express();
const port = 3000;
const Ekko = require("ekko-realtime-client");
const ekko = new Ekko({
  host: "myEkkoServerEndpoint",
  jwt: "myAppJWT",
  appName: "ekko-express",
  uuid: "myUniqueUUID",
});

ekko.subscribe({ channels: ["greeting"] });
ekko.addListener({
  message: (ekkoEvent) => {
    addMessage(ekkoEvent);
  },
  status: (ekkoEvent) => {
    addStatus(ekkoEvent.message);
  },
});

let counter = 0;
setInterval(() => {
  ekko.publish({
    channel: "greeting",
    message: { text: `Hello world! (${counter})` },
  });

  counter++;
}, 3000);

const addMessage = ({ channel, message, uuid }) => {
  console.log();
  console.log("Event Type:  Message");
  console.log("   Channel: ", channel);
  console.log(" Publisher: ", uuid);
  console.log("   Message: ", message);
};

const addStatus = ({ app, event }) => {
  console.log();
  console.log("Event Type:  Status");
  console.log("  App Name: ", app);
  console.log("   Message: ", event);
};

app.get("/", (req, res) => {
  res.send("Open server console to see ekko events");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
