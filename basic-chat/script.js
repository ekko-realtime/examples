const ekko = new Ekko({
  host: "http://localhost:3000/",
});

ekko.subscribe({ channels: ["steady"] });

ekko.addListener({
  message: function (event) {
    console.log(event.message.content);
  },
});

ekko.publish({
  message: { content: "fast fast" },
  channel: "steady",
});
