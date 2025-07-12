const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

function appendMessage(message, sender) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerHTML = message;
  chatContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function appendLoader() {
  const loader = document.createElement("div");
  loader.className = "loader";
  loader.id = "loader";
  loader.innerText = "FinBotX is thinking...";
  chatContainer.appendChild(loader);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.remove();
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  userInput.value = "";
  appendLoader();

  try {
    const res = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    removeLoader();
    appendMessage(data.html, "bot");
  } catch (err) {
    removeLoader();
    appendMessage("⚠️ Error connecting to FinBotX", "bot");
  }
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
