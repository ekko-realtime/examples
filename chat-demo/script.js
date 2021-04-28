document.addEventListener("DOMContentLoaded", () => {
  const ekko = new Ekko({
    appName: "app_1",
    host: "http://localhost:3000/",
    jwt:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBOYW1lIjoiYXBwXzEiLCJhZG1pbiI6dHJ1ZX0.3lLShIXVGN4w5JgON61QRHIDjierO_72Xti30L7aF_E",
  });

  ekko.subscribe({
    channels: ["channel_1"],
    withPresence: true,
  });

  ekko.addListener({
    message: handleMessage,
  });

  const submit = document.querySelector("#chat form input[type=submit]");
  const input = document.querySelector("#chat form input[type=text]");
  const initials = document.getElementById("initials");
  const channelContainers = document.querySelectorAll("#chat ul");
  const channelButtonContainer = document.querySelector("#channels ul");
  const channelButtons = [...channelButtonContainer.querySelectorAll("li")];
  let channelIdx = 0;

  initials.value = sessionStorage.getItem("initials") || ":)";

  submit.addEventListener("click", (event) => {
    event.preventDefault();

    const text = input.value;
    if (text) {
      ekko.publish({
        message: {
          type: "message",
          content: text,
          initials: getInitials(),
          channelIdx,
        },
        channel: `channel_1`,
      });
    }
  });

  initials.addEventListener("blur", () => {
    ekko.publish({
      message: {
        type: "initials",
        initials: getInitials(),
      },
      channel: `channel_1`,
    });
  });

  channelButtonContainer.addEventListener("click", (e) => {
    const node = e.target;
    channelIdx = +node.dataset.channel - 1;

    for (let i = 0; i < channelButtons.length; i++) {
      channelButtons[i].classList.remove("selected");
      channelContainers[i].classList.remove("selected");
    }

    channelContainers[channelIdx].classList.add("selected");
    node.classList.add("selected");
    scrollToBottom(channelIdx);
  });

  // Helpers
  const getInitials = () => {
    return initials.value.toUpperCase();
  };

  function handleMessage(event) {
    const messageType = event.message.type;

    if (messageType === "message") {
      const newMessage = generateHTML(event);
      addMessage(newMessage, event);
      resetForm();
    } else if (messageType === "initials") {
      setInitials(event);
      updateInitials(event);
    }
  }

  const resetForm = () => {
    input.value = "";
  };

  const setInitials = (event) => {
    sessionStorage.setItem("initials", event.message.initials);
  };

  const updateInitials = (event) => {
    const initials = [
      ...channelContainers[0].querySelectorAll(`[data-uuid="${event.uuid}"]`),
      ...channelContainers[1].querySelectorAll(`[data-uuid="${event.uuid}"]`),
      ...channelContainers[2].querySelectorAll(`[data-uuid="${event.uuid}"]`),
    ];

    initials.forEach((initial) => {
      initial.innerHTML = event.message.initials;
    });

    console.log(event);
  };

  const generateHTML = (event) => {
    const className = getClassName(event);
    const identity = event.message.initials;
    const text = event.message.content;
    const uuid = event.uuid;

    const template = `
    <li class="${className}">
      <div class="identity" data-uuid="${uuid}">${identity}</div>
      <div class="text">${text}</div>
    </li>
  `;

    return template;
  };

  const getClassName = (event) => {
    if (event.uuid === ekko.uuid) {
      return "me";
    } else {
      return "you";
    }
  };

  const addMessage = (message, event) => {
    const channel = +event.message.channelIdx;
    console.log(channel);
    const channelContainer = channelContainers[channel];
    channelContainer.innerHTML = channelContainer.innerHTML + message;
    scrollToBottom(channel);
  };

  const scrollToBottom = (channel) => {
    const messages = [...channelContainers[channel].querySelectorAll("li")];
    const last = messages[messages.length - 1];
    last.scrollIntoView();
  };

  // ekko
});
