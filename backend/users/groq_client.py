"""
groq_client.py — Centralized Groq AI client with automatic failover.
"""

import os
import json
import time
from groq import Groq


def _get_api_keys():
    keys = []
    primary = os.getenv("GROQ_API_KEY", "").strip()
    if primary:
        keys.append(primary)
    for i in range(2, 6):
        k = os.getenv(f"GROQ_API_KEY_{i}", "").strip()
        if k:
            keys.append(k)
    if not keys:
        raise ValueError("No GROQ_API_KEY found! Please set it in environment variables.")
    return keys

DEFAULT_MODEL = "mixtral-8x7b-32768"   # ✅ Stable, universally available
FAST_MODEL = "gemma2-9b-it"          # ✅ Fast, widely available


def call_groq(
    prompt,
    system_instruction=None,
    model=DEFAULT_MODEL,
    temperature=0.7,
    max_tokens=2048,
    is_json_output=False,
):
    keys = _get_api_keys()
    last_error = None

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})

    for i, api_key in enumerate(keys):
        try:
            client = Groq(api_key=api_key)
            kwargs = {
                "model": FAST_MODEL,   # Fast model for speed
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }
            if is_json_output:
                kwargs["response_format"] = {"type": "json_object"}

            response = client.chat.completions.create(**kwargs)
            text = response.choices[0].message.content.strip()

            if i > 0:
                print(f"[Groq Failover] Key #{i+1} succeeded after {i} failure(s).")
            return text

        except Exception as e:
            last_error = e
            print(f"[Groq] Key #{i+1} failed: {type(e).__name__}: {e}")
            if "rate_limit" in str(e).lower() or "429" in str(e):
                time.sleep(0.5)
            continue

    raise RuntimeError(f"All Groq API keys failed. Last error: {last_error}")


def call_groq_with_history(
    messages_history,
    system_instruction=None,
    model=DEFAULT_MODEL,
    temperature=0.7,
    max_tokens=2048,
):
    keys = _get_api_keys()
    last_error = None

    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.extend(messages_history)

    for i, api_key in enumerate(keys):
        try:
            client = Groq(api_key=api_key)
            response = client.chat.completions.create(
                model=DEFAULT_MODEL,   # Full model for chat
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            text = response.choices[0].message.content.strip()
            if i > 0:
                print(f"[Groq Failover] Chat Key #{i+1} succeeded after {i} failure(s).")
            return text

        except Exception as e:
            last_error = e
            print(f"[Groq] Chat Key #{i+1} failed: {type(e).__name__}: {e}")
            if "rate_limit" in str(e).lower() or "429" in str(e):
                time.sleep(0.5)
            continue

    raise RuntimeError(f"All Groq API keys failed for chat. Last error: {last_error}")


def clean_json_response(text):
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def call_groq_json(prompt, system_instruction=None, **kwargs):
    raw = call_groq(prompt, system_instruction=system_instruction, is_json_output=True, **kwargs)
    cleaned = clean_json_response(raw)
    return json.loads(cleaned)
