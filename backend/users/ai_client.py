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

GEMINI_MODEL = "gemini-2.5-flash"   # ✅ CONFIRMED working via API test
GEMINI_MODELS_FALLBACK = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro", "gemini-3.5-flash", "gemini-3.5-flash-lite"]
GEMINI_TIMEOUT = 25

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
    Gemini API call karta hai.
    Success → text return karta hai
    Fail → Exception raise karta hai (taaki Groq try ho sake)
    """
    from google import genai
    from google.genai import types

    keys = _get_gemini_keys()
    if not keys:
        raise ValueError("No GEMINI_API_KEY found in environment")

    models_to_try = GEMINI_MODELS_FALLBACK
    last_error = None

    for i, api_key in enumerate(keys):
        client = genai.Client(api_key=api_key)
        config = None
        if system_instruction:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
            )

        for model_name in models_to_try:
            try:
                resp = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config,
                )
                text = resp.text.strip()

                if i > 0 or model_name != models_to_try[0]:
                    print(f"[Gemini] Success: Key #{i+1}, Model: {model_name}")
                return text

            except Exception as e:
                last_error = e
                err_str = str(e).lower()
                print(f"[Gemini] Key #{i+1}, Model {model_name} failed: {type(e).__name__} - {str(e)[:80]}")
                
                # If 404 Not Found, try the next model. Otherwise (like API key invalid), try next key.
                if "404" in err_str or "not found" in err_str:
                    continue
                break # Break model loop, try next key

        # If we got here, all models failed for this key. Let's find out what models ARE available.
        try:
            import requests
            r = requests.get(f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}")
            available = [m.get('name') for m in r.json().get('models', [])]
            last_error = Exception(f"404 Not Found. Available models for your key: {available[:10]}")
        except Exception as e:
            pass

    raise RuntimeError(f"All Gemini keys/models failed. Last: {last_error}")


# ─── Groq Setup ───────────────────────────────────────────────────────────────

# Try these models in order — CONFIRMED available via API test on 2026-09-24
GROQ_MODELS_FALLBACK = [
    "qwen/qwen3.8-27b",          # ✅ Best: 27B params, fast, smart
    "openai/gpt-oss-20b",        # ✅ Medium: 20B, good quality
    "openai/gpt-oss-120b",       # ✅ Large: 120B, slower but powerful
    "allam-2-7b",                # ✅ Small: 7B, last resort
]
GROQ_MODEL = GROQ_MODELS_FALLBACK[0]
GROQ_FAST_MODEL = GROQ_MODELS_FALLBACK[0]


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
        for model_name in GROQ_MODELS_FALLBACK:
            try:
                client = Groq(api_key=api_key)
                kwargs = {
                    "model": model_name,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                if is_json:
                    kwargs["response_format"] = {"type": "json_object"}

                resp = client.chat.completions.create(**kwargs)
                text = resp.choices[0].message.content.strip()

                print(f"[Groq] Key #{i+1}, Model {model_name} ✓")
                return text

            except Exception as e:
                last_error = e
                err_str = str(e).lower()
                print(f"[Groq] Key #{i+1}, Model {model_name} failed: {str(e)[:80]}")
                # If model decommissioned or not found, try next model
                if "decommissioned" in err_str or "not found" in err_str or "does not exist" in err_str or "404" in err_str:
                    continue
                if "rate_limit" in err_str or "429" in str(e):
                    time.sleep(0.5)
                break  # Try next key for other errors

    # Auto-discover available models as last resort
    try:
        import requests
        r = requests.get("https://api.groq.com/openai/v1/models", headers={"Authorization": f"Bearer {keys[0]}"})
        available = [m['id'] for m in r.json().get('data', []) if 'whisper' not in m['id'] and 'guard' not in m['id'] and 'tts' not in m['id']]
        raise RuntimeError(f"All Groq keys/models failed. Available models on your key: {available[:8]}. Last error: {last_error}")
    except RuntimeError:
        raise
    except Exception:
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
        for model_name in GROQ_MODELS_FALLBACK:
            try:
                client = Groq(api_key=api_key)
                resp = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                text = resp.choices[0].message.content.strip()
                print(f"[Groq Chat] Key #{i+1}, Model {model_name} ✓")
                return text
            except Exception as e:
                last_error = e
                err_str = str(e).lower()
                print(f"[Groq Chat] Key #{i+1}, Model {model_name} failed: {str(e)[:80]}")
                if "decommissioned" in err_str or "not found" in err_str or "does not exist" in err_str or "404" in err_str:
                    continue
                if "rate_limit" in err_str or "429" in str(e):
                    time.sleep(0.5)
                break

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
      Gemini → (fail) → Groq key 1 → (fail) → Groq key 2 → ...
    """
    # Step 1: Gemini try karo
    gemini_error_msg = None
    try:
        text = _call_gemini(prompt, system_instruction=system_instruction)
        print("[AI] Used: Gemini ✓")
        return text
    except Exception as e:
        gemini_error_msg = f"{type(e).__name__}: {str(e)}"
        print(f"[AI] Gemini failed ({gemini_error_msg}), switching to Groq...")

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
            f"Both Gemini and Groq failed.\n"
            f"Gemini Error: {gemini_error_msg}\n"
            f"Groq Error: {groq_err}"
        )


def call_ai_json(prompt, system_instruction=None, max_tokens=2048, temperature=0.5):
    """
    JSON output ke liye — Gemini first, Groq fallback.
    Automatically parse karke dict return karta hai.
    """
    # Step 1: Gemini try karo
    gemini_error_msg = None
    try:
        text = _call_gemini(prompt, system_instruction=system_instruction)
        cleaned = clean_json_response(text)
        parsed = json.loads(cleaned)
        print("[AI JSON] Used: Gemini ✓")
        return parsed
    except json.JSONDecodeError as je:
        gemini_error_msg = f"JSONDecodeError: {str(je)}"
        print(f"[AI JSON] Gemini returned invalid JSON ({je}), switching to Groq...")
    except Exception as e:
        gemini_error_msg = f"{type(e).__name__}: {str(e)}"
        print(f"[AI JSON] Gemini failed ({type(e).__name__}), switching to Groq...")

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
            f"Both Gemini and Groq failed for JSON.\n"
            f"Gemini Error: {gemini_error_msg}\n"
            f"Groq Error: {groq_err}"
        )


def call_ai_fast_chat(messages_history, system_instruction=None, max_tokens=512, temperature=0.7):
    """
    ⚡ SPEED-OPTIMIZED CHAT — Groq llama-3.1-8b-instant FIRST!
    llama-3.1-8b-instant = sub-second responses on Groq.
    Fallback: Gemini → Groq 70B.

    Used for: Career Coach chatbot (speed > quality for short replies).
    """
    # ✅ Step 1: Groq 8B Instant FIRST — fastest possible response
    try:
        from groq import Groq
        keys = _get_groq_keys()
        if not keys:
            raise ValueError("No Groq keys")

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.extend(messages_history)

        client = Groq(api_key=keys[0])
        resp = client.chat.completions.create(
            model=GROQ_FAST_MODEL,   # llama-3.1-8b-instant — sub-second!
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        text = resp.choices[0].message.content.strip()
        print("[AI Fast Chat] Used: Groq 8B-Instant ✓")
        return text
    except Exception as groq_fast_err:
        print(f"[AI Fast Chat] Groq 8B failed ({type(groq_fast_err).__name__}), trying Gemini...")

    # Step 2: Gemini fallback
    try:
        text = call_ai_chat(
            messages_history,
            system_instruction=system_instruction,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return text
    except Exception as gemini_err:
        print(f"[AI Fast Chat] Gemini failed too, trying Groq 70B...")

    # Step 3: Groq 70B last resort
    return _call_groq_with_history(
        messages_history,
        system_instruction=system_instruction,
        max_tokens=max_tokens,
        temperature=temperature,
    )



def call_ai_chat(messages_history, system_instruction=None, max_tokens=1024, temperature=0.8):
    """
    Chat history ke saath call — Career Coach ke liye.
    Gemini first → Groq fallback.
    
    NOTE: Threading removed for Vercel serverless compatibility.
    """
    from google import genai
    from google.genai import types

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

        models_to_try = GEMINI_MODELS_FALLBACK
        success_text = None
        
        for model_name in models_to_try:
            try:
                resp = client.models.generate_content(
                    model=model_name,
                    contents=formatted,
                    config=config,
                )
                success_text = resp.text.strip()
                print(f"[AI Chat] Used: Gemini ({model_name}) ✓")
                break
            except Exception as e:
                if "404" in str(e) or "not found" in str(e).lower():
                    continue
                raise e
                
        if success_text:
            return success_text
            
        try:
            import requests
            r = requests.get(f"https://generativelanguage.googleapis.com/v1beta/models?key={gemini_keys[0]}")
            available = [m.get('name') for m in r.json().get('models', [])]
            raise RuntimeError(f"All chat models 404. Available on your key: {available[:10]}")
        except Exception:
            raise RuntimeError("All Gemini chat models returned 404.")

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
