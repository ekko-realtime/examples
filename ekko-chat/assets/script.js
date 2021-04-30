// App Components
const form = document.getElementById("form");
const input = document.getElementById("input");
const clear = document.getElementById("clear");
const channelNames = ["boring", "angry", "backwards", "robot"];
const channelList = document.querySelector("#channels ul");
const channels = [...channelList.querySelectorAll("li")];
const channelInfo = {
  boring: { originalText: "🙂 Boring", modifiedText: "🙂 Boring" },
  angry: { originalText: "😡 Angry", modifiedText: "😡 ANGRY!!!" },
  backwards: { originalText: "🙃 Backwards", modifiedText: "🙃 sdrawkcaB" },
  robot: { originalText: "🤖 Robot", modifiedText: "🤖 01010010" },
};

// ekko Initialization
const appName = "ekko-chat";
const host =
  "http://ekko-ekkos-1JK7FBDLWD4G0-283235194.us-east-2.elb.amazonaws.com";
const jwt =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZG1pbiI6ZmFsc2UsImFwcE5hbWUiOiJla2tvLWNoYXQiLCJpYXQiOjE2MTk3NDk2MDB9.L3qsPxSpm5hj1EfYm23H9bSIf5OtiSU0UXbu4Y0lZiQ";
const uuid = sessionStorage.getItem("uuid"); // Try to get uuid from browser session. ekko will asign a random one if none exists
const ekko = new Ekko({ appName, host, jwt, uuid });

ekko.subscribe({ channels: [...channelNames, "emoji"] });
ekko.addListener({ message: handleMessage });

// App Initialization
let currentChannelName = sessionStorage.getItem("channel") || "boring";
let currentEmoji = sessionStorage.getItem("emoji") || "🙂";
let currentChannel = channelList.querySelector(
  `li[data-channel=${currentChannelName}]`
);
sessionStorage.setItem("uuid", ekko.uuid); // Save uuid to browser session
initializeApp();

// Handle Message Event
function handleMessage(event) {
  switch (event.message.type) {
    case "message":
      addToMessageHistory(event);
      handleTextMessage(event);
      break;
    case "emoji":
      handleEmojiMessage(event);
      break;
  }
}

const addToMessageHistory = (event) => {
  const sessionMessages = sessionStorage.getItem("messages");
  let messages = [];
  if (sessionMessages) {
    messages = JSON.parse(sessionMessages).messages;
  }

  messages = messages.slice(messages.length - 100);
  messages.push(event);
  sessionStorage.setItem("messages", JSON.stringify({ messages }));
};

// Handle Channel Hover
channelList.addEventListener("mouseover", (event) => {
  const channel = event.target;
  if (channel.tagName !== "LI") return;
  const channelName = channel.dataset.channel;

  channel.innerHTML = channelInfo[channelName].modifiedText;

  channel.addEventListener("mouseout", (event) => {
    if (channel.classList.contains("selected")) return;
    channel.innerHTML = channelInfo[channelName].originalText;
  });
});

// Handle Channel Selection
channelList.addEventListener("click", (event) => {
  if (event.target.tagName !== "LI") return;
  const selectedChannel = event.target;
  handleChannelSelection(selectedChannel);
});

function handleChannelSelection(selectedChannel) {
  channels.forEach((channel) => {
    const channelName = channel.dataset.channel;
    const messagesBox = document.querySelector(`.messages.${channelName}`);

    if (channel === selectedChannel) {
      channel.classList.add("selected");
      channel.innerHTML = channelInfo[channelName].modifiedText;
      messagesBox.classList.add("selected");
      sessionStorage.setItem("channel", selectedChannel.dataset.channel);
    } else {
      channel.classList.remove("selected");
      channel.innerHTML = channelInfo[channelName].originalText;
      messagesBox.classList.remove("selected");
    }
  });

  scrollToBottom();
}

// Handle Form Submission
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value;
  if (!text) return;

  const message = {
    type: "message",
    text: text,
    emoji: currentEmoji,
  };

  channelNames.forEach((channel) => {
    ekko.publish({ message, channel });
  });

  clearInput();
  scrollToBottom();
});

function handleTextMessage({ message, channel, uuid }) {
  const messagesBox = document.querySelector(`.messages.${channel}`);
  let className = "yours";
  let emoji = message.emoji;
  const textOnly = /[a-z0-9]+/i.test(emoji);
  let textOrEmoji = "";
  const text = message.text;

  if (textOnly) {
    textOrEmoji = "textOnly";
  }

  if (uuid === ekko.uuid) {
    className = "mine";
    emoji = currentEmoji;
  }

  const messageHTML = `
  <dl class="message ${className}">
    <dt data-uuid="${uuid}" class="${textOrEmoji}">${emoji}</dt>
    <dd>${text}</dd>
  </dl>
  `;

  messagesBox.innerHTML = messagesBox.innerHTML + messageHTML;
  scrollToBottom();
}

// Handle Emoji Change
emoji.addEventListener("blur", () => {
  const newEmoji = emoji.value.toUpperCase();
  sessionStorage.setItem("emoji", newEmoji);
  currentEmoji = newEmoji;
  setEmoji(newEmoji);

  const message = {
    type: "emoji",
    emoji: newEmoji,
  };

  ekko.publish({ message, channel: "emoji" });
});

const handleEmojiMessage = (event) => {
  const emoji = event.message.emoji;
  const textOnly = /[a-z0-9]+/i.test(emoji);
  const emojiMessages = document.querySelectorAll(
    `dt[data-uuid="${event.uuid}"]`
  );
  emojiMessages.forEach((emojiMessage) => {
    emojiMessage.classList.remove("textOnly");
    emojiMessage.innerHTML = emoji;

    if (textOnly) {
      emojiMessage.classList.add("textOnly");
    }
  });
  updateEmojiHistory(event);
};

const updateEmojiHistory = (event) => {
  const sessionMessages = sessionStorage.getItem("messages");
  let messages = [];
  if (sessionMessages) {
    messages = JSON.parse(sessionMessages).messages;
  }
  messages.map((message) => {
    if (message.uuid === event.uuid) {
      message.message.emoji = event.message.emoji;
    }
    return message;
  });

  sessionStorage.setItem("messages", JSON.stringify({ messages }));
};

clear.addEventListener("click", (event) => {
  event.preventDefault();
  sessionStorage.setItem("messages", "");
  resetMessagesBoxes();
});

// Helpers
function scrollToBottom() {
  const messages = document.querySelectorAll(".messages.selected dt");
  if (messages.length === 0) return;
  const last = messages[messages.length - 1];
  last.scrollIntoView();
}

const clearInput = () => {
  input.value = "";
};

function setEmoji() {
  emoji.value = currentEmoji;
}

function resetMessagesBoxes() {
  const messagesBoxes = document.querySelectorAll(`.messages`);
  messagesBoxes.forEach((messagesBox) => {
    messagesBox.innerHTML = "";
  });
}

function populateMessages() {
  resetMessagesBoxes();
  const sessionMessages = sessionStorage.getItem("messages");
  let messages = [];

  if (sessionMessages) {
    messages = JSON.parse(sessionMessages).messages;
  }

  messages.forEach((message) => handleTextMessage(message));
}

function initializeApp() {
  populateMessages();
  handleChannelSelection(currentChannel);
  setEmoji();
  scrollToBottom();
}
