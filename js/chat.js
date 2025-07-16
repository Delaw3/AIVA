const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatWindow = document.getElementById('chatWindow');
const logoutBtn = document.getElementById('logoutBtn');
const micBtn = document.getElementById('micBtn');
const micIcon = document.getElementById('micIcon');
const inputContainer = document.getElementById('inputContainer');
const waveContainer = document.getElementById('waveContainer');
const listeningPopup = document.getElementById('listeningPopup');
const startSound = document.getElementById('startSound');
const stopSound = document.getElementById('stopSound');




let lastRenderedDate = '';
let isListening = false;
let speechDelayTimeout = null;
let fullTranscript = '';

// onAuthStateChanged(auth, async (user) => {
//   if (user) {
//     // User is still signed in
//     const token = await user.getIdToken();
//     localStorage.setItem("firebaseToken", token);
//     console.log("User session valid ", user.email);
//   } else {
//     // User is signed out
//     console.log("Not signed in ");
//     window.location.href = "index.html";
//   }
// });

const token = localStorage.getItem("firebaseToken");
if (!token) {
  window.location.href = "login.html";
}

function showTypingIndicator() {
  const typingEl = document.createElement('div');
  typingEl.className = 'message bot typing';
  typingEl.id = 'typingIndicator';
  typingEl.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
  chatWindow.appendChild(typingEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function removeTypingIndicator() {
  const typingEl = document.getElementById('typingIndicator');
  if (typingEl) typingEl.remove();
}


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;



if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  micBtn.addEventListener('click', () => {
    if (!isListening) {
      recognition.start();
      isListening = true;
      micIcon.classList.add('listening');
      startSound.play();
      showListeningUI();
    } else {
      recognition.stop();
      isListening = false;
      micIcon.classList.remove('listening');
      stopSound.play();
      showInputUI();
    }
  });

  recognition.onresult = (event) => {
  let interim = '';

  for (let i = event.resultIndex; i < event.results.length; ++i) {
    const result = event.results[i];
    if (result.isFinal) {
      // Only take the last result if it's different from the current fullTranscript
      if (!fullTranscript.includes(result[0].transcript.trim())) {
        fullTranscript += result[0].transcript + ' ';
      }
    } else {
      interim += result[0].transcript;
    }
  }

  chatInput.value = fullTranscript + interim;

  clearTimeout(speechDelayTimeout);
  speechDelayTimeout = setTimeout(() => {
    if (fullTranscript.trim()) {
      recognition.stop();
      isListening = false;
      micIcon.classList.remove('listening');
      showInputUI();
      chatForm.requestSubmit();
      fullTranscript = ''; // ✅ reset here
    }
  }, 1000);
};




  recognition.onerror = (err) => {
    console.error('Speech error:', err);
    isListening = false;
    micIcon.classList.remove('listening');
    showInputUI();
  };

  recognition.onend = () => {
    if (isListening) {
      recognition.start(); // auto-restart if still active
    }
  };
} else {
  micBtn.disabled = true;
  micBtn.title = "Speech recognition not supported";
}

// Chat form submit
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  const timestamp = new Date().toISOString();
  appendMessage(message, 'user', timestamp);
 
  showTypingIndicator(); // 👈 Show loading indicator

  try {
    const token = localStorage.getItem('firebaseToken');
    if (!token) window.location.href = "index.html"; 
    console.log("Firebase Token:", token);

    const res = await fetch('https://aivant-n8n.onrender.com/webhook/aivant-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        message,
        timestamp
      })
    });

     chatInput.value = '';
     fullTranscript = ''; // reset transcript after sending


    const data = await res.json();
    const reply = data.reply || "Sorry! I can't respond right now.";
    const replyTime = new Date().toISOString();

    removeTypingIndicator(); // 👈 Remove loading after response
    appendMessage(reply, 'bot', replyTime);
    speakText(reply);
  } catch (error) {
    removeTypingIndicator(); // 👈 Remove even if there's an error
    const errorMsg = "Assistant can't be reached now.";
    appendMessage(errorMsg, 'bot', new Date().toISOString());
    speakText(errorMsg);
    showErrorToast(errorMsg);
  }
});


// Logout
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('firebaseToken');
  window.location.href = 'index.html';
});

// Append messages with time/date
function appendMessage(text, sender, timestamp) {
  const messageDate = new Date(timestamp);
  const currentDateLabel = formatDateLabel(messageDate);

  if (currentDateLabel !== lastRenderedDate) {
    const dateEl = document.createElement('div');
    dateEl.className = 'date-header';
    dateEl.textContent = currentDateLabel;
    chatWindow.appendChild(dateEl);
    lastRenderedDate = currentDateLabel;
  }

  const wrapper = document.createElement('div');
  wrapper.className = `message ${sender}`;

  const messageEl = document.createElement('div');
  messageEl.textContent = text;

  const timeEl = document.createElement('small');
  timeEl.className = 'text-muted d-block mt-1';
  timeEl.style.fontSize = '0.75rem';
  timeEl.textContent = formatTime(timestamp);

  wrapper.appendChild(messageEl);
  wrapper.appendChild(timeEl);
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // ✅ Scroll to bottom *only after append*, and delayed to avoid push out on mobile
  setTimeout(() => {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 100);
}

function formatTime(isoString) {
  const date = new Date(isoString);
  const hours = date.getHours() % 12 || 12;
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  return `${hours}:${minutes} ${ampm}`;
}

function formatDateLabel(date) {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const inputDate = new Date(date.setHours(0, 0, 0, 0));

  if (inputDate.getTime() === today.getTime()) return 'Today';
  if (inputDate.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Voice response
function speakText(text) {
  const synth = window.speechSynthesis;
  if (!synth) return;

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = synth.getVoices();
  const femaleVoice = voices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google us english'));
  if (femaleVoice) utterance.voice = femaleVoice;

  utterance.pitch = 1;
  utterance.rate = 1;
  synth.speak(utterance);
}

// UI toggle functions
function showListeningUI() {
  inputContainer.style.display = 'none';
  waveContainer.style.display = 'flex';
  listeningPopup.style.display = 'block';
}

function showInputUI() {
  inputContainer.style.display = 'flex';
  waveContainer.style.display = 'none';
  listeningPopup.style.display = 'none';
}

window.addEventListener('beforeunload', () => {
  const allMessages = Array.from(chatWindow.children)
    .filter(el => el.classList.contains('message'))
    .map(el => ({
      text: el.querySelector('div')?.textContent,
      sender: el.classList.contains('user') ? 'user' : 'bot',
      timestamp: el.querySelector('small')?.textContent || new Date().toISOString()
    }));
  localStorage.setItem('aivantChatHistory', JSON.stringify(allMessages));
});

window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('aivantChatHistory');
  if (saved) {
    const messages = JSON.parse(saved);
    messages.forEach(msg => {
      appendMessage(msg.text, msg.sender, new Date().toISOString());
    });
  }
});

