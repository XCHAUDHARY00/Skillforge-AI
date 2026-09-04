"""
ai_client.py — Unified AI Client with Gemini-first, Groq-fallback strategy.

Strategy:
  1. Gemini API try karo (fast, free)
  2. Gemini fail ho jaye (timeout/error) → Groq try karo
  3. Groq mein bhi multiple keys hai failover ke liye
  4. Sab fail ho jaye → RuntimeError raise karo

Bug fixes:
  - Fixed GEMINI_MODEL to gemini-3.6-flash (currently active model)
  - Fixed Groq JSON mode: prompt mein 'json' word hona chahiye
  - Fixed get_gemini_response() signature compatibility
"""

import os
import json
import time

# ─── Gemini Setup ──────────────────────────────────────────────────────────────

GEMINI_MODEL = "gemini-3.6-flash"   # Current active Gemini model
GEMINI_TIMEOUT = 15  # seconds — agar 15s mein reply nahi → Groq pe switch

def _get_gemini_keys():
    """Gemini API keys collect karta hai env se."""
    keys = []
    primary = os.getenv("GEMINI_API_KEY", "").strip()
    if primary:
        keys.append(primary)
    for i in range(2, 4):
        k = os.getenv(f"GEMINI_API_KEY_{i}", "").strip()
        if k:
            keys.append(k)
    return keys


def _call_gemini(prompt, system_instruction=None):
    """
    Gemini API call karta hai with timeout via threading.
    Success → text return karta hai
    Fail → Exception raise karta hai (taaki Groq try ho sake)
    """
    from google import genai
    from google.genai import types
    import threading

    keys = _get_gemini_keys()
    if not keys:
        raise ValueError("No GEMINI_API_KEY found in environment")

    last_error = None
    for i, api_key in enumerate(keys):
        try:
            client = genai.Client(api_key=api_key)

            config = None
            if system_instruction:
                config = types.GenerateContentConfig(
                    system_instruction=system_instruction,
                )

            result = [None]
            error = [None]

            def _do_call():
                try:
                    resp = client.models.generate_content(
                        model=GEMINI_MODEL,
                        contents=prompt,
                        config=config,
                    )
                    result[0] = resp.text.strip()
                except Exception as e:
                    error[0] = e

            thread = threading.Thread(target=_do_call)
            thread.daemon = True
            thread.start()
            thread.join(timeout=GEMINI_TIMEOUT)

            if thread.is_alive():
                raise TimeoutError(f"Gemini timed out after {GEMINI_TIMEOUT}s")

            if error[0]:
                raise error[0]

            if result[0] is not None:
                if i > 0:
                    print(f"[Gemini Failover] Key #{i+1} succeeded.")
                return result[0]

        except Exception as e:
            last_error = e
            print(f"[Gemini] Key #{i+1} failed: {type(e).__name__}: {str(e)[:120]}")
            continue

    raise RuntimeError(f"All Gemini keys failed. Last: {last_error}")


# ─── Groq Setup ───────────────────────────────────────────────────────────────

GROQ_MODEL = "qwen/qwen3.8-27b"
GROQ_FAST_MODEL = "qwen/qwen3.6-27b"


def _get_groq_keys():
    """Groq API keys collect karta hai env se."""
    keys = []
    primary = os.getenv("GROQ_API_KEY", "").strip()
    if primary:
        keys.append(primary)
    for i in range(2, 6):
        k = os.getenv(f"GROQ_API_KEY_{i}", "").strip()
        if k:
            keys.append(k)
    return keys


def _call_groq(prompt, system_instruction=None, is_json=False, max_tokens=2048, temperature=0.7):
    """
    Groq API call karta hai with multiple key failover.
    
    BUG FIX: Groq JSON mode mein prompt mein 'json' word hona chahiye.
    Agar is_json=True hai aur prompt mein 'json' nahi → automatically add karte hain.
    """
    from groq import Groq

    keys = _get_groq_keys()
    if not keys:
        raise ValueError("No GROQ_API_KEY found in environment")

    # Groq JSON mode requirement fix: prompt must contain word 'json'
    actual_prompt = prompt
    if is_json and 'json' not in prompt.lower():
        actual_prompt = prompt + "\n\nIMPORTANT: Return your response as valid JSON only."

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": actual_prompt})

    last_error = None
    for i, api_key in enumerate(keys):
        try:
            client = Groq(api_key=api_key)
            kwargs = {
                "model": GROQ_MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            if is_json:
                kwargs["response_format"] = {"type": "json_object"}

            resp = client.chat.completions.create(**kwargs)
            text = resp.choices[0].message.content.strip()

            if i > 0:
                print(f"[Groq Failover] Key #{i+1} succeeded.")
            return text

        except Exception as e:
            last_error = e
            print(f"[Groq] Key #{i+1} failed: {type(e).__name__}: {str(e)[:100]}")
            if "rate_limit" in str(e).lower() or "429" in str(e):
                time.sleep(0.5)
            continue

    raise RuntimeError(f"All Groq keys failed. Last: {last_error}")


def _call_groq_with_history(messages_history, system_instruction=None, max_tokens=1024, temperature=0.8):
    """
    Groq call with full chat history (Career Coach ke liye).
    """
    from groq import Groq

    keys = _get_groq_keys()
    if not keys:
        raise ValueError("No GROQ_API_KEY found in environment")

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.extend(messages_history)

    last_error = None
    for i, api_key in enumerate(keys):
        try:
            client = Groq(api_key=api_key)
            resp = client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            text = resp.choices[0].message.content.strip()
            if i > 0:
                print(f"[Groq Failover] Chat Key #{i+1} succeeded.")
            return text
        except Exception as e:
            last_error = e
            print(f"[Groq] Chat Key #{i+1} failed: {str(e)[:100]}")
            if "rate_limit" in str(e).lower() or "429" in str(e):
                time.sleep(0.5)
            continue

    raise RuntimeError(f"All Groq keys failed for chat. Last: {last_error}")


# ─── Utility ──────────────────────────────────────────────────────────────────

def clean_json_response(text):
    """Markdown code blocks hata deta hai AI response se."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


# ─── Public API (Gemini → Groq failover) ─────────────────────────────────────

def call_ai(prompt, system_instruction=None, max_tokens=2048, temperature=0.7):
    """
    MAIN FUNCTION — Gemini pehle try karo, fail ho to Groq.
    
    Bhai yahi woh smart system hai:
      Gemini → (fail/timeout 15s) → Groq key 1 → (fail) → Groq key 2 → ...
    """
    # Step 1: Gemini try karo
    try:
        text = _call_gemini(prompt, system_instruction=system_instruction)
        print("[AI] Used: Gemini ✓")
        return text
    except Exception as gemini_err:
        print(f"[AI] Gemini failed ({type(gemini_err).__name__}), switching to Groq...")

    # Step 2: Groq fallback
    try:
        text = _call_groq(
            prompt,
            system_instruction=system_instruction,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        print("[AI] Used: Groq (fallback) ✓")
        return text
    except Exception as groq_err:
        raise RuntimeError(
            f"Both Gemini and Groq failed. "
            f"Gemini error logged above | Groq: {groq_err}"
        )


def call_ai_json(prompt, system_instruction=None, max_tokens=2048, temperature=0.5):
    """
    JSON output ke liye — Gemini first, Groq fallback.
    Automatically parse karke dict return karta hai.
    """
    # Step 1: Gemini try karo
    try:
        text = _call_gemini(prompt, system_instruction=system_instruction)
        cleaned = clean_json_response(text)
        parsed = json.loads(cleaned)
        print("[AI JSON] Used: Gemini ✓")
        return parsed
    except json.JSONDecodeError as je:
        print(f"[AI JSON] Gemini returned invalid JSON ({je}), switching to Groq...")
    except Exception as gemini_err:
        print(f"[AI JSON] Gemini failed ({type(gemini_err).__name__}), switching to Groq...")

    # Step 2: Groq fallback (JSON mode)
    try:
        text = _call_groq(
            prompt,
            system_instruction=system_instruction,
            is_json=True,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        parsed = json.loads(clean_json_response(text))
        print("[AI JSON] Used: Groq (fallback) ✓")
        return parsed
    except Exception as groq_err:
        raise RuntimeError(
            f"Both Gemini and Groq failed for JSON. "
            f"Last Groq error: {groq_err}"
        )


def call_ai_chat(messages_history, system_instruction=None, max_tokens=1024, temperature=0.8):
    """
    Chat history ke saath call — Career Coach ke liye.
    Gemini first → Groq fallback.
    """
    from google import genai
    from google.genai import types
    import threading

    # Step 1: Gemini try karo with history
    try:
        gemini_keys = _get_gemini_keys()
        if not gemini_keys:
            raise ValueError("No Gemini key")

        client = genai.Client(api_key=gemini_keys[0])

        # Convert history to Gemini format
        formatted = []
        for msg in messages_history:
            role = 'user' if msg['role'] == 'user' else 'model'
            formatted.append(types.Content(role=role, parts=[types.Part(text=msg['content'])]))

        config = None
        if system_instruction:
            config = types.GenerateContentConfig(system_instruction=system_instruction)

        result = [None]
        error = [None]

        def _do_call():
            try:
                resp = client.models.generate_content(
                    model=GEMINI_MODEL,
                    contents=formatted,
                    config=config,
                )
                result[0] = resp.text.strip()
            except Exception as e:
                error[0] = e

        thread = threading.Thread(target=_do_call)
        thread.daemon = True
        thread.start()
        thread.join(timeout=GEMINI_TIMEOUT)

        if thread.is_alive():
            raise TimeoutError(f"Gemini chat timed out after {GEMINI_TIMEOUT}s")

        if error[0]:
            raise error[0]

        if result[0]:
            print("[AI Chat] Used: Gemini ✓")
            return result[0]

    except Exception as gemini_err:
        print(f"[AI Chat] Gemini failed ({type(gemini_err).__name__}), switching to Groq...")

    # Step 2: Groq fallback
    text = _call_groq_with_history(
        messages_history,
        system_instruction=system_instruction,
        max_tokens=max_tokens,
        temperature=temperature,
    )
    print("[AI Chat] Used: Groq (fallback) ✓")
    return text
