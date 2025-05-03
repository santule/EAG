from flask import Flask, Response, request
import queue
import threading
import time

app = Flask(__name__)

# Thread-safe queue for messages from the bot
message_queue = queue.Queue()

def event_stream():
    while True:
        try:
            # Wait for a new message from the bot
            msg = message_queue.get(timeout=60)
            if msg:  # Only send non-empty messages
                yield f"data: {msg}\n\n"
            # If msg is empty, skip sending
        except queue.Empty:
            # Keep connection alive with a comment (does not trigger SSE message event)
            yield ": keepalive\n\n"

@app.route('/events')
def sse_events():
    return Response(event_stream(), mimetype='text/event-stream')

@app.route('/send', methods=['POST'])
def send_message():
    data = request.get_json()
    msg = data.get('message', '')
    if msg:
        message_queue.put(msg)
        return {'status': 'ok'}, 200
    return {'status': 'no message'}, 400

if __name__ == '__main__':
    app.run(port=5000, threaded=True)
