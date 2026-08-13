import json
import re

from app.services.factory.provider_factory import ProviderFactory


class QualityEvaluator:

    JUDGE_MODEL = "deepseek/deepseek-chat-v3-0324"

    REQUIRED_FIELDS = [
        "relevance",
        "correctness",
        "coherence",
        "instruction_following",
        "overall",
    ]

    @staticmethod
    async def evaluate(
        prompt: str,
        response: str,
    ) -> dict:

        judge_prompt = f"""
You are an expert LLM evaluation judge.

Your job is to evaluate the MODEL RESPONSE strictly against the ORIGINAL PROMPT.

================ ORIGINAL PROMPT ================
{prompt}

================ MODEL RESPONSE ================
{response}

==================================================

Evaluate the response on these five dimensions.

1. RELEVANCE
Does the response directly address what the user asked for?

2. CORRECTNESS
Is the response factually accurate and logically valid based on the information available in the prompt?

3. COHERENCE
Is the response clear, logically organized, consistent, and easy to understand?

4. INSTRUCTION FOLLOWING
This is a STRICT evaluation.

You MUST check every explicit instruction and constraint in the ORIGINAL PROMPT.

Examples of explicit constraints include:

- "exactly 3 sentences"
- "3 concise sentences"
- "under 100 words"
- "less than 50 words"
- "exactly 5 items"
- "return JSON only"
- "use bullet points"
- "use a numbered list"
- "answer in one paragraph"
- "do not include explanations"
- "return only the answer"
- specific formatting requirements
- required fields
- requested language
- requested number of examples/items

IMPORTANT:

A response can be factually correct but still have LOW instruction-following.

For example:

ORIGINAL PROMPT:
"Summarize the text in exactly 3 concise sentences."

MODEL RESPONSE:
A long 10-paragraph explanation.

Even if the information is correct, this response violates the explicit instruction and MUST receive a low instruction_following score.

Similarly:

ORIGINAL PROMPT:
"Return exactly 5 bullet points."

MODEL RESPONSE:
A paragraph containing the correct information.

This should receive a low instruction_following score because the requested format was not followed.

Another example:

ORIGINAL PROMPT:
"Return only valid JSON."

MODEL RESPONSE:
"Sure! Here is the JSON:
{{...}}"

This violates the instruction because additional text was included.

You must prioritize explicit constraints when scoring instruction_following.

IMPORTANT INSTRUCTION-FOLLOWING CHECK:

Before assigning the instruction_following score, identify the explicit
instructions that actually exist in the ORIGINAL PROMPT.

Evaluate ONLY those instructions.

For each instruction, determine whether the MODEL RESPONSE satisfies it.

Do NOT carry over constraints from previous prompts, examples, or evaluations.

For example, if the ORIGINAL PROMPT says:

"Answer the following question in exactly 2 sentences."

Then ONLY the following instruction exists:

- The response must contain exactly 2 sentences.

If the MODEL RESPONSE contains exactly 2 sentences, it has satisfied
that instruction.

Words such as "solar", "wind", "sustainable", "clean", or "environment"
must NOT be treated as violations unless the ORIGINAL PROMPT explicitly
prohibits those words.

Likewise, do NOT penalize the response for failing to follow a formatting
requirement, word restriction, forbidden-word rule, or other constraint
that is NOT explicitly present in the ORIGINAL PROMPT.

Instruction following must be based exclusively on the ORIGINAL PROMPT
shown above.

5. OVERALL
Give an overall quality score considering relevance, correctness, coherence, and instruction following.

================ SCORING ================

Use a score from 0 to 10.

10 = Excellent
9 = Very strong
8 = Strong
7 = Good
6 = Acceptable
5 = Average
4 = Weak
3 = Poor
2 = Very poor
1 = Almost completely failed
0 = Completely failed

================ IMPORTANT SCORING RULES ================

Do NOT give a high instruction_following score simply because the response contains useful or correct information.

Explicit instructions must actually be satisfied.

For "exactly N sentences":
- Count the sentences in the MODEL RESPONSE.
- If the response does not contain exactly N sentences, reduce instruction_following substantially.

For word limits:
- Check whether the response respects the requested limit.

For item counts:
- Check whether the requested number of items is actually provided.

For formatting:
- Check whether the requested format is followed.

For JSON-only requests:
- Check that the response contains only valid JSON.

For language requirements:
- Check whether the response uses the requested language.

Do not invent requirements that were not present in the ORIGINAL PROMPT.

================ OUTPUT FORMAT ================

Return ONLY a valid JSON object.

Do NOT use markdown.

Do NOT use ```json.

Do NOT include explanations.

Do NOT include additional fields.

Return exactly this structure:

{{
  "relevance": 0,
  "correctness": 0,
  "coherence": 0,
  "instruction_following": 0,
  "overall": 0
}}

All values MUST be numbers between 0 and 10.
"""

        provider = ProviderFactory.get_provider("openrouter")

        try:
            result = await provider.generate(
                prompt=judge_prompt,
                model=QualityEvaluator.JUDGE_MODEL,
            )

        except Exception as exc:
            raise RuntimeError(
                f"Quality evaluator LLM failed: {exc}"
            ) from exc

        raw_response = result.get("response_text")

        if raw_response is None:
            raise ValueError(
                "Quality evaluator returned no response text."
            )

        raw_response = str(raw_response).strip()

        if not raw_response:
            raise ValueError(
                "Quality evaluator returned an empty response."
            )

        # ---------------------------------------------------------
        # Clean common markdown formatting
        # ---------------------------------------------------------

        cleaned_response = raw_response

        cleaned_response = re.sub(
            r"^```json\s*",
            "",
            cleaned_response,
            flags=re.IGNORECASE,
        )

        cleaned_response = re.sub(
            r"^```\s*",
            "",
            cleaned_response,
        )

        cleaned_response = re.sub(
            r"\s*```$",
            "",
            cleaned_response,
        )

        cleaned_response = cleaned_response.strip()

        # ---------------------------------------------------------
        # Parse JSON
        # ---------------------------------------------------------

        try:
            scores = json.loads(cleaned_response)

        except json.JSONDecodeError:

            # Try extracting the first JSON object.
            match = re.search(
                r"\{.*\}",
                cleaned_response,
                flags=re.DOTALL,
            )

            if not match:
                raise ValueError(
                    "Quality evaluator returned invalid JSON: "
                    f"{raw_response}"
                )

            try:
                scores = json.loads(match.group(0))

            except json.JSONDecodeError as exc:
                raise ValueError(
                    "Quality evaluator returned invalid JSON: "
                    f"{raw_response}"
                ) from exc

        # ---------------------------------------------------------
        # Validate object
        # ---------------------------------------------------------

        if not isinstance(scores, dict):
            raise ValueError(
                "Quality evaluator response must be a JSON object."
            )

        # ---------------------------------------------------------
        # Validate required scores
        # ---------------------------------------------------------

        for field in QualityEvaluator.REQUIRED_FIELDS:

            if field not in scores:
                raise ValueError(
                    f"Quality evaluator missing score: {field}"
                )

            try:
                value = float(scores[field])

            except (TypeError, ValueError) as exc:
                raise ValueError(
                    f"Invalid {field} score: {scores[field]}"
                ) from exc

            if value < 0 or value > 10:
                raise ValueError(
                    f"Invalid {field} score: {value}. "
                    "Score must be between 0 and 10."
                )

            scores[field] = value

        return scores