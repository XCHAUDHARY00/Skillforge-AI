"""
interview_service.py — Mock Interview AI Service.
Strategy: Gemini pehle try karo, fail ho to Groq automatically fallback karta hai.
"""

import json
from django.utils import timezone
from .ai_client import call_ai, call_ai_json, clean_json_response


# ─── Legacy Compatibility Wrappers ────────────────────────────────────────────
# Yeh functions purane naam rakhe hain taaki views.py break na ho.

def get_gemini_response(prompt, system_instruction=None):
    """
    Legacy function — internally Gemini first, Groq fallback use karta hai.
    """
    return call_ai(prompt, system_instruction=system_instruction)


def get_gemini_model(system_instruction=None):
    """
    Legacy wrapper — views.py mein get_gemini_model().generate_content() calls ke liye.
    """
    class _AIModelWrapper:
        def __init__(self, sys_inst):
            self.sys_inst = sys_inst

        def generate_content(self, prompt):
            text = call_ai(prompt, system_instruction=self.sys_inst)
            class _Resp:
                pass
            r = _Resp()
            r.text = text
            return r

    return _AIModelWrapper(system_instruction)


# ─── Interview Functions ───────────────────────────────────────────────────────

def start_gemini_interview(profile, target_role, difficulty, interview_type):
    """
    Pehla interview question generate karta hai.
    Gemini first → Groq fallback.
    """
    skills = [skill.name for skill in profile.skills.all()]
    skills_text = ", ".join(skills) if skills else "No skills added yet"
    experience = profile.experience or "Fresher"

    system_instruction = (
        "You are an elite, professional technical interviewer conducting a mock job interview.\n"
        f"Candidate Profile:\n"
        f"- Target Role: {target_role}\n"
        f"- Experience Level: {experience}\n"
        f"- Known Skills: {skills_text}\n"
        f"- Difficulty Level: {difficulty}\n"
        f"- Interview Type: {interview_type}\n\n"
        "Guidelines:\n"
        "1. Ask exactly one single question to start the interview.\n"
        "2. Do not include any greeting, introduction, or setup commentary.\n"
        "3. Output ONLY the question text itself. No markdown, no quotes."
    )

    try:
        return call_ai(
            "Generate the very first interview question for the candidate.",
            system_instruction=system_instruction,
            temperature=0.8,
            max_tokens=300,
        )
    except Exception as e:
        print(f"Error starting interview: {e}")
        return (
            f"To start the interview, could you describe a challenging technical project "
            f"you've worked on recently as a {target_role} and explain how you overcame its main challenges?"
        )


def evaluate_and_generate_next(session, last_question, answer_text, next_question_number):
    """
    Pichle answer evaluate karo + next question generate karo.
    Gemini first → Groq fallback.
    """
    past_questions = session.questions.all().order_by('timestamp')
    history_lines = []
    for q in past_questions:
        history_lines.append(f"Question: {q.question_text}")
        if q == last_question:
            history_lines.append(f"Answer: {answer_text}")
        else:
            history_lines.append(f"Answer: {q.user_answer or '[Skipped]'}")
            if q.ai_feedback:
                history_lines.append(f"Feedback: {q.ai_feedback}")

    history_text = "\n".join(history_lines)

    if next_question_number == 5:
        coding_instruction = (
            "Since this is the 5th and final question, it MUST be a coding question. "
            "Ask the candidate to write a specific code snippet or function."
        )
    else:
        coding_instruction = "Ask a relevant theory/conceptual interview question matching the role and difficulty."

    system_instruction = (
        "You are an expert technical interviewer. Evaluate interview answers and generate follow-up questions. "
        "Always respond with pure valid JSON only — no markdown, no explanation."
    )

    prompt = f"""Evaluate this ongoing mock interview for the role of '{session.target_role}' (Difficulty: '{session.difficulty}', Type: '{session.interview_type}').

Interview History:
{history_text}

Tasks:
1. Evaluate the candidate's last answer: "{answer_text}"
   to the question: "{last_question.question_text}"
2. Assign a score (1-10).
3. Generate Question #{next_question_number} of 5. {coding_instruction}

Return ONLY valid JSON (no markdown):
{{
    "evaluation": "1-2 sentences of constructive feedback.",
    "score": 8,
    "next_question": "The text of the next question",
    "is_coding": {"true" if next_question_number == 5 else "false"}
}}"""

    try:
        result = call_ai_json(prompt, system_instruction=system_instruction, temperature=0.7)
        return result
    except Exception as e:
        print(f"Error in evaluate_and_generate_next: {e}")
        fallback_questions = {
            2: "How do you handle database optimizations (like indexing or caching) when designing high-traffic APIs?",
            3: "Explain what asynchronous programming is and how it is useful in a web application context.",
            4: "Describe how you handle authentication, authorization, and securing REST APIs in production.",
            5: "Write a Python function to check if a given binary tree is a valid Binary Search Tree (BST).",
        }
        next_q = fallback_questions.get(
            next_question_number,
            f"Describe how you handle testing and CI/CD workflows for a {session.target_role} codebase."
        )
        return {
            "evaluation": "Answer recorded successfully.",
            "score": 8,
            "next_question": next_q,
            "is_coding": next_question_number == 5
        }


def finalize_interview_scores(session):
    """
    Complete interview evaluate karo, scores calculate karo.
    Gemini first → Groq fallback.
    """
    questions = session.questions.all().order_by('timestamp')
    transcript_lines = []
    for idx, q in enumerate(questions, 1):
        transcript_lines.append(f"Q{idx}: {q.question_text}")
        transcript_lines.append(f"A{idx}: {q.user_answer or '[Skipped]'}")
        if q.ai_feedback:
            transcript_lines.append(f"Feedback: {q.ai_feedback}")

    transcript_text = "\n\n".join(transcript_lines)

    system_instruction = (
        "You are a senior engineering manager reviewing mock interview transcripts. "
        "Provide fair performance scores. Always respond with pure valid JSON only."
    )

    prompt = f"""Review the complete transcript of the mock interview and provide a final performance report.

Candidate:
- Target Role: {session.target_role}
- Experience Level: {session.user_profile.experience or 'Fresher'}
- Difficulty: {session.difficulty}
- Interview Type: {session.interview_type}

Transcript:
{transcript_text}

Return ONLY valid JSON (no markdown):
{{
    "technical_score": 85,
    "communication_score": 75,
    "problem_solving_score": 80,
    "clarity_score": 82,
    "confidence_score": 88,
    "overall_score": 82,
    "summary": "The candidate has a solid understanding of...",
    "strengths": ["Strong explanation of Django MVC architecture", "Good coding structure"],
    "areas_to_improve": ["Utilize the STAR method for behavioral answers", "Deepen knowledge of database indexing"]
}}"""

    try:
        result = call_ai_json(prompt, system_instruction=system_instruction, temperature=0.5)
        session.technical_score = result.get("technical_score", 70)
        session.communication_score = result.get("communication_score", 70)
        session.problem_solving_score = result.get("problem_solving_score", 70)
        session.clarity_score = result.get("clarity_score", 70)
        session.confidence_score = result.get("confidence_score", 70)
        session.overall_score = result.get("overall_score", 70)
        session.summary = result.get("summary", "Interview completed.")
        session.strengths = result.get("strengths", [])
        session.areas_to_improve = result.get("areas_to_improve", [])

    except Exception as e:
        print(f"Error finalizing interview scores: {e}")
        q_count = session.questions.all().count()
        answered_count = session.questions.exclude(
            user_answer__isnull=True
        ).exclude(user_answer="").exclude(user_answer="[Skipped]").count()
        base_score = int((answered_count / max(1, q_count)) * 80)
        session.technical_score = max(50, base_score + 10)
        session.communication_score = max(50, base_score + 5)
        session.problem_solving_score = max(50, base_score + 8)
        session.clarity_score = max(50, base_score + 4)
        session.confidence_score = max(50, base_score + 6)
        session.overall_score = max(50, base_score + 7)
        session.summary = f"Mock interview completed. Answered {answered_count} of {q_count} questions."
        session.strengths = ["Completed the structured session", "Provided responses for all questions asked"]
        session.areas_to_improve = ["Revise technical core architecture", "Practice coding challenges under time limits"]

    session.status = 'completed'
    session.end_time = timezone.now()
    session.save()
    return session
