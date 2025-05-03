import warnings
warnings.filterwarnings("ignore")

from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters
import os
from dotenv import load_dotenv
import requests

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Hello! I'm your bot. Let's Practice.")

# handle user messages
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_text = update.message.text
    user_name = update.effective_user.first_name

    print(f"{user_name} said: {user_text}")  # log to terminal

    # Post the user request to the SSE server (one-way)
    try:
        resp = requests.post("http://127.0.0.1:5000/send", json={"message": user_text})
        #print(f"[SSE] POST status: {resp.status_code}, response: {resp.text}")
    except Exception as e:
        print(f"[SSE] Failed to send message: {e}")

    # Optionally reply to the user (or remove this if not needed)
    await update.message.reply_text("Your request has been received!")

if __name__ == '__main__':
    load_dotenv()
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    app = ApplicationBuilder().token(token).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))  # handles all text except commands

    print("Bot is running...")
    app.run_polling()