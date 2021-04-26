const ekko = new Ekko({
  appName: "app1",
  host: "http://localhost:3000/",
  jwt:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBOYW1lIjoiYXBwMSIsImFkbWluIjp0cnVlfQ.1bSLFJ2NBsxPtCEUEET6VvmM2DYHFa480JUZF9Xme60",
});

ekko.subscribe({ channels: ["channel_1"] });

ekko.addListener({
  message: function (event) {
    console.log(event.message);
  },
  status: function (event) {
    console.log(event.message);
  },
});

const input = document.getElementById("input");
const button = document.getElementById("button");
const ul = document.getElementById("ul");

button.addEventListener("click", () => {
  const text = input.value;

  if (text) {
    ekko.publish({
      message: { content: text },
      channel: "channel_1",
    });
  }
});
