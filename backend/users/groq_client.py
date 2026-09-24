"""
groq_client.py — Centralized Groq AI client with automatic multi-model failover.

Strategy: Loop through multiple models. If one is decommissioned/unavailable,
automatically try the next model. This prevents breakage when Groq retires models.
"""

import os
import json
import time
from groq import Groq


# Models to try in order — if one is decommissioned, next one runs automatically
MODELS_FALLBACK = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "llama-4-scout-17b-16e-instruct",
    "gemma2-9b-it",
    "mixtral-8x7b-32768",
]

DEFAULT_MODEL = MODELS_FALLBACK[0]
FAST_MODEL = MODELS_FALLBACK[0]


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


def _is_model_error(err_str):
    """Check if error is about model availability (decommissioned/not found)."""
    return any(keyword in err_str for keyword in [
        "decommissioned", "not found", "does not exist", "404", "model_not_found"
    ])


def call_groq(
    prompt,
    system_instruction=None,
    model=None,
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
        for model_name in MODELS_FALLBACK:
            try:
                client = Groq(api_key=api_key)
                kwargs = {
                    "model": model_name,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                if is_json_output:
                    kwargs["response_format"] = {"type": "json_object"}

                response = client.chat.completions.create(**kwargs)
                text = response.choices[0].message.content.strip()

                print(f"[Groq] Key #{i+1}, Model {model_name} ✓")
                return text

            except Exception as e:
                last_error = e
                err_str = str(e).lower()
                print(f"[Groq] Key #{i+1}, Model {model_name} failed: {str(e)[:80]}")
                if _is_model_error(err_str):
                    continue  # Try next model
                if "rate_limit" in err_str or "429" in str(e):
                    time.sleep(0.5)
                break  # Try next key for other errors

    raise RuntimeError(f"All Groq API keys/models failed. Last error: {last_error}")


def call_groq_with_history(
    messages_history,
    system_instruction=None,
    model=None,
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
        for model_name in MODELS_FALLBACK:
            try:
                client = Groq(api_key=api_key)
                response = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                text = response.choices[0].message.content.strip()
                print(f"[Groq Chat] Key #{i+1}, Model {model_name} ✓")
                return text

            except Exception as e:
                last_error = e
                err_str = str(e).lower()
                print(f"[Groq Chat] Key #{i+1}, Model {model_name} failed: {str(e)[:80]}")
                if _is_model_error(err_str):
                    continue  # Try next model
                if "rate_limit" in err_str or "429" in str(e):
                    time.sleep(0.5)
                break  # Try next key for other errors

    raise RuntimeError(f"All Groq API keys/models failed for chat. Last error: {last_error}")


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
