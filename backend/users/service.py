"""
service.py — Career AI Services.
Strategy: Gemini pehle try karo, fail ho to Groq automatically fallback karta hai.
"""

import json
from .ai_client import call_ai, call_ai_json, call_ai_chat


# ─── Career Roadmap ────────────────────────────────────────────────────────────

def generate_career_roadmap(user_profile):
    """
    User ki profile dekh kar step-by-step career roadmap generate karta hai.
    Gemini first → Groq fallback.
    """
    skills = [skill.name for skill in user_profile.skills.all()]
    skills_text = ", ".join(skills) if skills else "No skills added yet"
    latest_goal = user_profile.user_career_goals.last()
    goal_title = latest_goal.title if latest_goal else "General Career Growth"

    system_instruction = (
        "You are an elite AI Career Coach. Generate structured, actionable career roadmaps. "
        "Always respond with pure valid JSON only — no markdown, no explanation, no extra text."
    )

    prompt = f"""Based on the following user profile, generate a step-by-step learning roadmap to help them achieve their goal.

User Profile:
- Experience Level: {user_profile.experience}
- Known Skills: {skills_text}
- Target Goal: {goal_title}

Return ONLY this exact JSON format (no markdown):
{{
    "roadmap": [
        {{
            "step": 1,
            "title": "Learn the Basics",
            "description": "Start with learning fundamental concepts.",
            "estimated_time": "2 weeks",
            "resources": ["Course link 1", "Book name"]
        }}
    ]
}}
Generate 6-8 steps minimum."""

    try:
        result = call_ai_json(prompt, system_instruction=system_instruction)
        return result
    except Exception as e:
        print("Roadmap Error:", str(e))
        return {"error": "Failed to generate roadmap. Please try again."}


# ─── Career Coach Chat ─────────────────────────────────────────────────────────

def interact_with_career_coach(user_profile, new_message):
    """
    Career coach chat — Gemini first, Groq fallback.
    """
    from .models import ChatMessage

    # Database se purani chat history
    chat_history_qs = ChatMessage.objects.filter(user_profile=user_profile).order_by('timestamp')

    # History convert karo
    formatted_history = []
    for msg in chat_history_qs:
        role = 'user' if msg.sender == 'user' else 'assistant'
        formatted_history.append({"role": role, "content": msg.message})

    # Naya message add karo
    formatted_history.append({"role": "user", "content": new_message})

    # System instruction
    skills = [skill.name for skill in user_profile.skills.all()]
    skills_text = ", ".join(skills) if skills else "No skills added yet"
    latest_goal = user_profile.user_career_goals.last()
    goal_title = latest_goal.title if latest_goal else "General Career Growth"
    goal_desc = latest_goal.description if latest_goal else ""

    system_instruction = f"""You are an elite AI Career Coach named "CareerMind AI Coach". 
Your goal is to guide the user on their career path, answer career-related questions, and help them achieve their goals.

User Profile:
- Experience Level: {user_profile.experience}
- Known Skills: {skills_text}
- Target Career Goal: {goal_title} ({goal_desc})

Give professional, practical, and highly motivating answers. Keep your answers brief, clean, and conversational."""

    try:
        ai_response_text = call_ai_chat(
            formatted_history,
            system_instruction=system_instruction,
            max_tokens=1024,
            temperature=0.8,
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
    Career DNA analysis — Gemini first, Groq fallback.
    """
    skills = [skill.name for skill in user_profile.skills.all()]
    skills_text = ", ".join(skills) if skills else "No skills added yet"
    experience = user_profile.experience or "Fresher"
    latest_goal = user_profile.user_career_goals.last()
    goal_title = latest_goal.title if latest_goal else "General Software Development"

    system_instruction = (
        "You are an AI Career Analyst. Analyze student profiles and return structured JSON. "
        "Always respond with pure valid JSON only — no markdown, no extra text."
    )

    prompt = f"""Analyze the following student profile and return a detailed career DNA analysis.

Student Profile:
- Experience: {experience}
- Skills: {skills_text}
- Target Goal: {goal_title}

Return ONLY valid JSON in this exact format:
{{
    "radar_data": [
        {{"subject": "Backend", "score": 8}},
        {{"subject": "Frontend", "score": 4}},
        {{"subject": "AI/ML", "score": 3}},
        {{"subject": "DevOps", "score": 2}},
        {{"subject": "Databases", "score": 7}},
        {{"subject": "System Design", "score": 3}}
    ],
    "career_paths": [
        {{"role": "Backend Developer", "match": 86, "icon": "⚙️", "color": "#6366f1"}},
        {{"role": "Full Stack Developer", "match": 65, "icon": "🖥️", "color": "#3b82f6"}},
        {{"role": "AI Engineer", "match": 45, "icon": "🤖", "color": "#8b5cf6"}}
    ],
    "personality_tags": ["Builder", "Analytical", "Problem Solver"],
    "strengths": ["Python", "Django", "SQL"],
    "growth_areas": ["Docker", "System Design", "React"],
    "readiness_score": 72,
    "ai_summary": "2-3 line analysis of the student career potential and next steps."
}}"""

    try:
        result = call_ai_json(prompt, system_instruction=system_instruction)
        return result
    except Exception as e:
        print("Career DNA Error:", str(e))
        return {"error": f"Failed to analyze career DNA: {str(e)}"}


# ─── Skill Gap Analysis ────────────────────────────────────────────────────────

def analyze_skill_gaps(user_profile, target_role):
    """
    Skill gap analysis — Gemini first, Groq fallback.
    """
    skills = [skill.name for skill in user_profile.skills.all()]
    skills_text = ", ".join(skills) if skills else "None"

    system_instruction = (
        "You are a Career Skills Analyst. Compare student skills against job role requirements. "
        "Always respond with pure valid JSON only."
    )

    prompt = f"""Compare this student's skills against the requirements for the role: "{target_role}".

Student's current skills: {skills_text}

Return ONLY valid JSON in this exact format:
{{
    "target_role": "{target_role}",
    "overall_gap_score": 65,
    "skill_gaps": [
        {{
            "id": 1,
            "name": "Docker",
            "category": "DevOps",
            "current": 2,
            "required": 7,
            "gap": 5,
            "priority": "high",
            "reason": "Docker is essential for deploying backend apps in production."
        }}
    ]
}}

Priority rules: gap >= 5 → "high", gap 3 or 4 → "medium", gap <= 2 → "low"
Return exactly 6 to 8 skills. overall_gap_score is 0-100 (higher = more ready)."""

    try:
        result = call_ai_json(prompt, system_instruction=system_instruction)
        return result
    except Exception as e:
        print("Skill Gap Error:", str(e))
        return {"error": f"Failed to analyze skill gaps: {str(e)}"}
