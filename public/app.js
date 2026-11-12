const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const mode = document.getElementById("mode");
const messages = document.getElementById("chatMessages");
const thinking = document.getElementById("thinking");

let history = [];

function addMessage(role, text) {
  const wrapper = document.createElement("div");
  wrapper.className = `message ${role}`;

  const label = document.createElement("span");
  label.className = "message-label";
  label.textContent = role === "user" ? "YOU" : "NEXORA";

  const content = document.createElement("p");
  content.textContent = text;

  wrapper.appendChild(label);
  wrapper.appendChild(content);

  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = input.value.trim();

  if (!message) {
    return;
  }

  addMessage("user", message);

  input.value = "";
  input.disabled = true;
  thinking.classList.add("active");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        mode: mode.value,
        history,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    const reply = data.reply || "I couldn't generate a response.";

    addMessage("assistant", reply);

    history.push(
      {
        role: "user",
        content: message,
      },
      {
        role: "assistant",
        content: reply,
      }
    );
  } catch (error) {
    addMessage(
      "assistant",
      `Nexora error: ${error.message}`
    );
  } finally {
    thinking.classList.remove("active");
    input.disabled = false;
    input.focus();
  }
});

const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
  }
);

revealElements.forEach((element) => {
  observer.observe(element);
});
