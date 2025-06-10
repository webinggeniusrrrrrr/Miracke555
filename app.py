from flask import Flask, render_template_string
from flask_socketio import SocketIO, send
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'chatapp'
socketio = SocketIO(app, cors_allowed_origins="*")

# HTML content served directly
html = """
<!DOCTYPE html>
<html>
<head>
  <title>Flask Chat App</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f4f4f4; }
    #messages { list-style: none; padding: 0; max-height: 300px; overflow-y: auto; background: #fff; border: 1px solid #ccc; margin-bottom: 10px; }
    #messages li { padding: 5px 10px; border-bottom: 1px solid #eee; }
    input { padding: 10px; width: 70%; }
    button { padding: 10px; }
  </style>
  <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
  <h2>Flask Chat App</h2>
  <ul id="messages"></ul>
  <input id="messageInput" placeholder="Type your message..." autocomplete="off" />
  <button onclick="sendMessage()">Send</button>

  <script>
    const socket = io();

    socket.on("message", (msg) => {
      const li = document.createElement("li");
      li.textContent = msg;
      document.getElementById("messages").appendChild(li);
    });

    function sendMessage() {
      const input = document.getElementById("messageInput");
      if (input.value.trim() !== '') {
        socket.send(input.value);
        input.value = '';
      }
    }
  </script>
</body>
</html>
"""

@app.route('/')
def index():
    return render_template_string(html)

@socketio.on('message')
def handle_message(msg):
    print(f"Received: {msg}")
    send(msg, broadcast=True)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host='0.0.0.0', port=port)
