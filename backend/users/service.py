"""
service.py — Career AI Services. SPEED OPTIMIZED.

Speed Strategy:
  - Chat: Groq llama-3.1-8b-instant FIRST (sub-second!) → Gemini fallback
  - Analysis: Gemini first (quality matters, cached anyway) → Groq fallback
  - History: Only last 8 messages (less tokens = faster)
  - max_tokens: Reduced to minimum needed per function
"""

import json
from .ai_client import call_ai, call_ai_json, call_ai_chat, call_ai_fast_chat


# ─── Career Roadmap ────────────────────────────────────────────────────────────

def generate_career_roadmap(user_profile):
    """
    Career roadmap — cached after first call, so first-time only is slow.
    """
    skills = [s.name for s in user_profile.skills.only('name').all()]
    skills_text = ", ".join(skills) if skills else "No skills"
    latest_goal = user_profile.user_career_goals.last()
    goal_title = latest_goal.title if latest_goal else "Software Developer"

    system_instruction = (
        "You are a Career Coach AI. Return only valid JSON. No markdown. No extra text."
    )

    prompt = f"""Generate career roadmap JSON.
Profile: experience={user_profile.experience}, skills={skills_text}, goal={goal_title}

Return ONLY this JSON (6 steps, be concise):
{{"roadmap":[{{"step":1,"title":"Title","description":"Brief desc.","estimated_time":"2 weeks","resources":["Resource 1"]}}]}}"""

    try:
        result = call_ai_json(prompt, system_instruction=system_instruction, max_tokens=900)
        return result
    except Exception as e:
        print("Roadmap Error:", str(e))
        return {"error": "Failed to generate roadmap. Please try again."}


# ─── Career Coach Chat ─────────────────────────────────────────────────────────

def interact_with_career_coach(user_profile, new_message):
    """
    Career coach chat — GROQ FIRST (llama-3.1-8b-instant = sub-second!).
    Strategy: Groq 8B instant → Gemini fallback → Groq 70B fallback.
    History: Only last 8 messages to keep tokens low = faster.
    """
    from .models import ChatMessage

    # ✅ Only last 8 messages (speed optimization — less tokens = faster)
    chat_history_qs = ChatMessage.objects.filter(
        user_profile=user_profile
    ).order_by('-timestamp')[:8]

    # Reverse to get chronological order
    formatted_history = []
    for msg in reversed(list(chat_history_qs)):
        role = 'user' if msg.sender == 'user' else 'assistant'
        formatted_history.append({"role": role, "content": msg.message})

    # New message add karo
    formatted_history.append({"role": "user", "content": new_message})

    # ✅ Compact system prompt (less tokens = faster processing)
    skills = [s.name for s in user_profile.skills.only('name').all()[:10]]
    skills_text = ", ".join(skills) if skills else "Not specified"
    latest_goal = user_profile.user_career_goals.last()
    goal_title = latest_goal.title if latest_goal else "Career Growth"

    system_instruction = (
        f"You are CareerMind AI Coach. Be brief, helpful, motivating.\n"
        f"User: exp={user_profile.experience}, skills={skills_text}, goal={goal_title}.\n"
        f"Keep responses concise (under 150 words). Be conversational and direct."
    )

    try:
        # ✅ GROQ FIRST — llama-3.1-8b-instant is sub-second!
        ai_response_text = call_ai_fast_chat(
            formatted_history,
            system_instruction=system_instruction,
            max_tokens=512,
            temperature=0.7,
        )

        # Save both messages to DB
        ChatMessage.objects.create(user_profile=user_profile, sender='user', message=new_message)
        ChatMessage.objects.create(user_profile=user_profile, sender='ai', message=ai_response_text)

        return {"response": ai_response_text}

    except Exception as e:
        print("Chatbot Error:", str(e))
        return {"error": f"AI Coach error: {str(e)}"}


# ─── Career DNA Analysis ───────────────────────────────────────────────────────

def analyze_career_dna(user_profile):
    """
    Career DNA analysis — cached after first call.
    """
    skills = [s.name for s in user_profile.skills.only('name').all()]
    skills_text = ", ".join(skills) if skills else "None"
    experience = user_profile.experience or "Fresher"
    latest_goal = user_profile.user_career_goals.last()
    goal_title = latest_goal.title if latest_goal else "Software Developer"

    system_instruction = "You are a Career Analyst AI. Return only valid JSON. No markdown."

    prompt = f"""Analyze this profile and return career DNA JSON.
experience={experience}, skills={skills_text}, goal={goal_title}

Return ONLY this JSON format:
{{"radar_data":[{{"subject":"Backend","score":8}},{{"subject":"Frontend","score":4}},{{"subject":"AI/ML","score":3}},{{"subject":"DevOps","score":2}},{{"subject":"Databases","score":7}},{{"subject":"System Design","score":3}}],"career_paths":[{{"role":"Backend Developer","match":86,"icon":"⚙️","color":"#6366f1"}},{{"role":"Full Stack","match":65,"icon":"🖥️","color":"#3b82f6"}},{{"role":"AI Engineer","match":45,"icon":"🤖","color":"#8b5cf6"}}],"personality_tags":["Builder","Analytical","Problem Solver"],"strengths":["Python","Django"],"growth_areas":["Docker","React"],"readiness_score":72,"ai_summary":"2 sentence analysis here."}}"""

    try:
        result = call_ai_json(prompt, system_instruction=system_instruction, max_tokens=800)
        return result
    except Exception as e:
        print("Career DNA Error:", str(e))
        return {"error": f"Failed to analyze career DNA: {str(e)}"}


# ─── Skill Gap Analysis ────────────────────────────────────────────────────────

def analyze_skill_gaps(user_profile, target_role):
    """
    Skill gap analysis — cached per role after first call.
    """
    skills = [s.name for s in user_profile.skills.only('name').all()]
    skills_text = ", ".join(skills) if skills else "None"

    system_instruction = "You are a Skills Analyst AI. Return only valid JSON. No markdown."

    prompt = f"""Compare skills for role "{target_role}".
Current skills: {skills_text}

Return ONLY this JSON (exactly 6 skills):
{{"target_role":"{target_role}","overall_gap_score":65,"skill_gaps":[{{"id":1,"name":"Docker","category":"DevOps","current":2,"required":7,"gap":5,"priority":"high","reason":"Essential for production."}}]}}

Rules: gap>=5=high, gap 3-4=medium, gap<=2=low. overall_gap_score 0-100 (higher=more ready)."""

    try:
        result = call_ai_json(prompt, system_instruction=system_instruction, max_tokens=700)
        return result
    except Exception as e:
        print("Skill Gap Error:", str(e))
        return {"error": f"Failed to analyze skill gaps: {str(e)}"}

