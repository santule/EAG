from perception import PerceptionResult
from memory import MemoryItem
from typing import List, Optional
from dotenv import load_dotenv
import google.generativeai as genai
import os

# Optional: import log from agent if shared, else define locally
try:
    from agent import log
except ImportError:
    import datetime
    def log(stage: str, msg: str):
        now = datetime.datetime.now().strftime("%H:%M:%S")
        print(f"[{now}] [{stage}] {msg}")

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.0-flash')

def generate_plan(
    perception: PerceptionResult,
    memory_items: List[MemoryItem],
    tool_descriptions: Optional[str] = None
) -> str:
    """Generates a plan (tool call or final answer) using LLM based on structured perception and memory."""

    memory_texts = "\n".join(f"- {m.text}" for m in memory_items) or "None"

    tool_context = f"\nYou have access to the following tools:\n{tool_descriptions}" if tool_descriptions else ""

    prompt = f"""

You are a reasoning-driven AI agent generating Multiple Choice Questions with access to tools. Your job is to solve the user's request step-by-step by reasoning through the problem, selecting a tool if needed, and continuing until the FINAL_ANSWER is produced.{tool_context}

You will create {perception.questions} multiple-choice questions (MCQs) based on the content available to you via knowledge base.

Instructions:
Each MCQ should have 1 correct answer and 3 plausible but incorrect distractors.

Clearly mark the correct answer.
Keep the questions clear and concise.
Provide the answer key at the end.
Example format:
Q1. Question?
(A) OptionA
(B) OptionB
(C) OptionC
(D) OptionD
Answer: (Correct option letter)
Number of Questions: {perception.questions}
Difficulty: {perception.difficulty}

Always follow this loop:

1. Think step-by-step about the problem.
2. If a tool is needed, respond using the format:
   FUNCTION_CALL: tool_name|param1=value1|param2=value2
3. When the final answer is known, respond using:
   FINAL_ANSWER: [your final result]

Guidelines:
- Respond using EXACTLY ONE of the formats above per step.
- Do NOT include extra text, explanation, or formatting.
- Use nested keys (e.g., input.string) and square brackets for lists.
- You can reference these relevant memories:
{memory_texts}

Input Summary:
- User input: {perception.user_input}
- Intent: {perception.intent}
- Questions: {perception.questions}
- Difficulty: {perception.difficulty}
- Tool hint: {perception.tool_hint or 'None'}

✅ Examples:
- FUNCTION_CALL: add|a=5|b=3
- FUNCTION_CALL: strings_to_chars_to_int|input.string=INDIA
- FUNCTION_CALL: int_list_to_exponential_sum|input.int_list=[73,78,68,73,65]
- FINAL_ANSWER: [42]

✅ Examples:
- User asks: "Lets practice 2 easy questions."
- Task: Create 2 multiple-choice questions (MCQs) based on the content available to you in the knowledge base with difficulty level easy.

Instructions:
Each MCQ should have 1 correct answer and 3 plausible but incorrect distractors.
Clearly mark the correct answer.
Vary the difficulty: easy to medium.
Keep the questions clear and concise.
Provide the answer key at the end.

Example format:
Q1. What is the main pigment used in photosynthesis?
(A) Chlorophyll
(B) Hemoglobin
(C) Melanin
(D) Keratin

Answer: (A)

IMPORTANT:
- 🚫 Do NOT invent tools. Use only the tools listed below.
- 📄 If the question may relate to factual knowledge, use the 'search_documents' tool to look for the answer.
- 🧮 If the question is mathematical or needs calculation, use the appropriate math tool.
- 🤖 If the previous tool output already contains factual information, DO NOT search again. Instead, summarize the relevant facts and respond with: FINAL_ANSWER: [your answer]
- Only repeat `search_documents` if the last result was irrelevant or empty.
- ❌ Do NOT repeat function calls with the same parameters.
- ❌ Do NOT output unstructured responses.
- 🧠 Think before each step. Verify intermediate results mentally before proceeding.
- 💥 If unsure or no tool fits, skip to FINAL_ANSWER: [unknown]
- ✅ You have only {perception.questions} attempts. Final attempt must be FINAL_ANSWER
"""

    try:
        response = model.generate_content(
            contents=prompt
        )
        raw = response.text.strip()
        log("plan", f"LLM output: {raw}")

        for line in raw.splitlines():
            if line.strip().startswith("FUNCTION_CALL:") or line.strip().startswith("FINAL_ANSWER:"):
                return line.strip()

        return raw.strip()

    except Exception as e:
        log("plan", f"⚠️ Decision generation failed: {e}")
        return "FINAL_ANSWER: [unknown]"
