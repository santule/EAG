import warnings
warnings.filterwarnings("ignore")

from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters
import subprocess
import os
from dotenv import load_dotenv

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Hello! I'm your MCQ bot. Let's Practice.")

# handle user messages
async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_text = update.message.text
    user_name = update.effective_user.first_name

    print(f"{user_name} said: {user_text}")  # log to terminal

    # Run agent.py with user_text as input and capture output
    try:
        result = subprocess.run(
            ["python", "mcq_agent.py"],
            input=user_text.encode(),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd="/Users/Shared/projects/EAG/S8",
            timeout=120
        )
        agent_output = result.stdout.decode(errors="ignore").strip()
        if not agent_output:
            agent_output = result.stderr.decode(errors="ignore").strip()
        response = agent_output if agent_output else "[No output from agent.py]"
    except Exception as e:
        response = f"Error running agent.py: {e}"

    mcq_response = response.split("MCQS:")[1].strip()
    # Remove leading/trailing square brackets if present
    if mcq_response.startswith("[") and mcq_response.endswith("]"):
        mcq_response = mcq_response[1:-1].strip()
    # Split and send the response in chunks (Telegram max: 4096 chars)
    MAX_MESSAGE_LENGTH = 4096
    for i in range(0, len(mcq_response), MAX_MESSAGE_LENGTH):
        await update.message.reply_text(mcq_response[i:i+MAX_MESSAGE_LENGTH])

if __name__ == '__main__':
    load_dotenv()
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    app = ApplicationBuilder().token(token).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))  # handles all text except commands

    print("Bot is running...")
    app.run_polling()