const ekko = new Ekko({
  appName: "app2",
  host: "http://localhost:3000/",
  jwt:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBOYW1lIjoiYXBwMiIsImFkbWluIjpmYWxzZSwiaWF0IjoxNTE2MjM5MDIyfQ.VnbLe6ZWqizhSl9AqjVvGwlkxD0WEhoLAJIlpvbSbAY",
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
