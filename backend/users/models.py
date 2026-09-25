from django.db.models import ForeignKey
from django.contrib.auth.models import User
from django.db import models

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )
    experience = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    skills = models.ManyToManyField(Skill, related_name='user_profiles', blank=True)
    
    # Social Links
    github_username = models.CharField(max_length=100, blank=True, null=True)
    linkedin_url = models.URLField(max_length=300, blank=True, null=True)
    
    # AI Cached Data
    career_dna_data = models.JSONField(null=True, blank=True)
    skill_gaps_data = models.JSONField(null=True, blank=True)
    roadmap_data = models.JSONField(null=True, blank=True)
    github_data = models.JSONField(null=True, blank=True)      # GitHub analysis cache
    github_data_updated = models.DateTimeField(null=True, blank=True)  # Cache timestamp
    
    # Resume
    resume_text = models.TextField(blank=True, null=True)       # Extracted PDF text
    resume_filename = models.CharField(max_length=200, blank=True, null=True)
    resume_analysis = models.JSONField(null=True, blank=True)   # Gemini analysis result

    # App Login Streak
    app_login_streak = models.IntegerField(default=0)
    last_app_login = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.user.username

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

class Education(models.Model):
    user_profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="user_educations"
    )
    course = models.CharField(max_length=100, blank=True)
    institution = models.CharField(max_length=100, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.course} from {self.institution}"

class CareerGoal(models.Model):
    user_profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="user_career_goals"
    )
    title = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    target_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.title
class ChatMessage(models.Model):
    SENDER_CHOICES = [
        ('user', 'User'),
        ('ai', 'AI'),
    ]
    
    user_profile = models.ForeignKey(
        UserProfile, 
        on_delete=models.CASCADE, 
        related_name="chat_messages"
    )
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}: {self.message[:30]}..."


class InterviewSession(models.Model):
    STATUS_CHOICES = [
        ('ongoing', 'Ongoing'),
        ('completed', 'Completed'),
        ('terminated', 'Terminated'),
    ]
    
    user_profile = models.ForeignKey(
        UserProfile,
        on_delete=models.CASCADE,
        related_name="interview_sessions"
    )
    target_role = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=50, default='Medium')
    interview_type = models.CharField(max_length=50, default='Technical')
    
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ongoing')
    
    technical_score = models.IntegerField(null=True, blank=True)
    communication_score = models.IntegerField(null=True, blank=True)
    problem_solving_score = models.IntegerField(null=True, blank=True)
    clarity_score = models.IntegerField(null=True, blank=True)
    confidence_score = models.IntegerField(null=True, blank=True)
    overall_score = models.IntegerField(null=True, blank=True)
    summary = models.TextField(blank=True, null=True)
    strengths = models.JSONField(null=True, blank=True)
    areas_to_improve = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.user_profile.user.username} - {self.target_role} ({self.status})"


class InterviewQuestion(models.Model):
    session = models.ForeignKey(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name="questions"
    )
    question_text = models.TextField()
    user_answer = models.TextField(blank=True, null=True)
    is_coding = models.BooleanField(default=False)
    ai_feedback = models.TextField(blank=True, null=True)
    score = models.IntegerField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Q for Session {self.session.id}: {self.question_text[:30]}..."


class PasswordResetOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="password_otps")
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.otp}"


