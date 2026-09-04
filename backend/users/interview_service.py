"""
interview_service.py — Mock Interview AI Service using Groq API.
Gemini se Groq pe migrate kiya gaya hai with automatic failover support.
"""

import json
from django.utils import timezone
from .groq_client import call_groq, call_groq_json, clean_json_response


# ─── Legacy compatibility wrapper (used by battles/views.py & views.py) ────────

def get_gemini_response(prompt, system_instruction=None):
    """
    Legacy function name rakha hai taaki purana code break na ho.
    Internally Groq use karta hai ab.
    """
    return call_groq(prompt, system_instruction=system_instruction)


def get_gemini_model(system_instruction=None):
    """
    Legacy wrapper — views.py mein get_gemini_model() calls ke liye.
    Ek fake model object return karta hai jo internally Groq use karta hai.
    """
    class _GroqModelWrapper:
        def __init__(self, sys_inst):
            self.sys_inst = sys_inst

        def generate_content(self, prompt):
            text = call_groq(prompt, system_instruction=self.sys_inst)
            class _Resp:
                pass
            r = _Resp()
            r.text = text
            return r

    return _GroqModelWrapper(system_instruction)


# ─── Interview Functions ───────────────────────────────────────────────────────

def start_gemini_interview(profile, target_role, difficulty, interview_type):
    """
    Pehla interview question generate karta hai.
    (Function name 'gemini' rakha hai backward compatibility ke liye)
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
        "Role & Guidelines:\n"
        "1. Ask exactly one single question to start the interview.\n"
        "2. Do not include any greeting, friendly introduction, or setup commentary.\n"
        "3. Output ONLY the question text itself. No markdown, no quotes, no conversational filler."
    )

    try:
        return call_groq(
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
    Pichle answer ko evaluate karta hai aur next question generate karta hai.
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
            "Since this is the 5th and final question of the interview, it MUST be a coding question.\n"
            "Ask the candidate to write a specific code snippet or function to solve a technical problem relevant to the role."
        )
    else:
        coding_instruction = "Ensure the question is a relevant theory/conceptual interview question matching the role and difficulty."

    system_instruction = (
        "You are an expert technical interviewer. Evaluate interview answers and generate follow-up questions. "
        "Always respond with pure valid JSON only — no markdown, no explanation."
    )

    prompt = f"""You are evaluating an ongoing mock interview for the role of '{session.target_role}' (Difficulty: '{session.difficulty}', Type: '{session.interview_type}').

Interview History so far:
{history_text}

Task:
1. Evaluate the candidate's last answer: "{answer_text}"
   to the question: "{last_question.question_text}"
2. Assign a score (1-10) for this answer.
3. Generate the next question (Question #{next_question_number} of 5).
   {coding_instruction}

Return ONLY a valid JSON object (no markdown):
{{
    "evaluation": "1-2 sentences of constructive feedback.",
    "score": 8,
    "next_question": "The text of the next question",
    "is_coding": {"true" if next_question_number == 5 else "false"}
}}"""

    try:
        result = call_groq_json(prompt, system_instruction=system_instruction, temperature=0.7)
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
    Saari answers evaluate karta hai, scores calculate karta hai, session update karta hai.
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
        "Provide fair, accurate performance scores. "
        "Always respond with pure valid JSON only — no markdown, no explanation."
    )

    prompt = f"""Review the complete transcript of the mock interview and provide a final performance report.

Candidate Profile:
- Target Role: {session.target_role}
- Experience Level: {session.user_profile.experience or 'Fresher'}
- Target Difficulty: {session.difficulty}
- Interview Type: {session.interview_type}

Complete Interview Transcript:
{transcript_text}

Evaluate the candidate across 5 metrics (0-100) and return ONLY valid JSON:
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
        result = call_groq_json(prompt, system_instruction=system_instruction, temperature=0.5)

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
        answered_qs = session.questions.exclude(user_answer__isnull=True).exclude(user_answer="").exclude(user_answer="[Skipped]")
        answered_count = answered_qs.count()
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
