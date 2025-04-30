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

You are a reasoning-driven AI agent generating Multiple Choice Questions with access to tools. 
Your job is to solve the user's request step-by-step by reasoning through the problem, selecting a tool if needed, 
and continuing until the FINAL_ANSWER is produced.{tool_context}

You will create {perception.questions} multiple-choice questions (MCQs) based on the content available to you 
via knowledge base by randomly selecting one from available topics and write the mcqs to {perception.write_to_application}.

Instructions:
Each MCQ should have 1 correct answer and 3 plausible but incorrect distractors.

1. Clearly mark the correct answer.
2. Vary the difficulty: easy to hard.
3. Keep the questions clear and concise.
4. Provide the answer key at the end.
5. **Correct Answer:** You have already provided the correct answer, which you should not repeat.
6. **Plausibility:** The incorrect answer should be realistic and convincing, mirroring the correct answer in length and format.
7. **Uniqueness:** Ensure your response is unique compared to previous incorrect answers provided.
8. **Structure:** Follow the format and complexity of the correct answer to maintain consistency. The answer should be short and concise.
9. Provide a short explanation after the answer.

Examples of good incorrect, but realistic answcers you should give as a response:
- If the question is "What is the purpose of early stopping in training machine learning models?", an appropriate incorrect, but realistic answer would be 
"Early stopping improves model performance by continuing training until the model achieves 100% accuracy on the training set." 
because it is false, but also a realistic answer for this question.

- If the question is "What is transfer learning?", an appropriate incorrect, but realistic answer would be 
"Transfer learning trains multiple models in parallel and transfers the best-performing weights to a final ensemble."
because it is false, but also a realistic answer for this question.

Example format:
Q1. In machine learning, what does the bias-variance tradeoff refer to?

(A) The balance between a model's accuracy and its training time
(B) The conflict between underfitting and overfitting in model performance
(C) The tradeoff between model interpretability and scalability
(D) The choice between supervised and unsupervised learning techniques

Answer: (B)
Explaination: The bias-variance tradeoff describes how models with high bias tend to underfit the data (too simple),
while models with high variance tend to overfit (too complex). A good model finds a balance between the two for optimal generalization.

Number of Questions: {perception.questions}
Difficulty: {perception.difficulty}

Always follow this loop:

1. Think step-by-step about the problem.
2. If a tool is needed, respond using the format:
   FUNCTION_CALL: tool_name|param1=value1|param2=value2
   if the function call does not have any parameters then just use FUNCTION_CALL: tool_name
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
- User asks: "Lets practice 2 easy questions in keynote."
- Task: Create 2 multiple-choice questions (MCQs) based on the content available to you in the knowledge base with difficulty level easy and provide explaination and write all mcqs to the keynote.

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
            if line.strip().startswith("FUNCTION_CALL:"):
                return line.strip()
            elif line.strip().startswith("FINAL_ANSWER:"):
                return raw

        return raw.strip()

    except Exception as e:
        log("plan", f"⚠️ Decision generation failed: {e}")
        return "FINAL_ANSWER: [unknown]"
