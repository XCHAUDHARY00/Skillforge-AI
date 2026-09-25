from rest_framework import serializers
from .models import UserProfile,Skill,Education,CareerGoal

from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    user_educations = serializers.SerializerMethodField()
    user_career_goals = serializers.SerializerMethodField()
    career_xp = serializers.SerializerMethodField()
    streak = serializers.SerializerMethodField()
    readiness_score = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'experience', 'bio', 'skills',
            'user_educations', 'user_career_goals',
            'github_username', 'linkedin_url',
            'github_data', 'resume_filename', 'resume_analysis',
            'skill_gaps_data', 'career_dna_data', 'roadmap_data',
            'career_xp', 'streak', 'readiness_score',
        ]
        depth = 1

    def get_user_educations(self, obj):
        from .models import Education
        return EducationSerializer(obj.user_educations.all(), many=True).data

    def get_user_career_goals(self, obj):
        from .models import CareerGoal
        return CareerGoalSerializer(obj.user_career_goals.all(), many=True).data

    def get_career_xp(self, obj):
        skills_count = obj.skills.count()
        has_github = 500 if obj.github_username else 0
        has_resume = 400 if obj.resume_analysis else 0
        interviews_count = obj.interview_sessions.filter(status='completed').count()
        educations_count = obj.user_educations.count()
        goals_count = obj.user_career_goals.count()
        return 250 + (skills_count * 50) + has_github + has_resume + (interviews_count * 300) + (educations_count * 100) + (goals_count * 100)

    def get_streak(self, obj):
        return obj.app_login_streak

    def get_readiness_score(self, obj):
        if obj.career_dna_data and 'readiness_score' in obj.career_dna_data:
            return obj.career_dna_data['readiness_score']
        
        skills_count = obj.skills.count()
        base = 50 + min(25, skills_count * 3)
        if obj.github_username:
            base += 10
        if obj.resume_analysis:
            base += 10
        return min(95, base)


class UserRegistrationSerializer(serializers.ModelSerializer):
    # Password sirf write-only hona chahiye, API response mein kabhi wapas nahi dikhna chahiye
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password']
    
    # Ye function override karna zaroori hai password ko hash (encrypt) karne ke liye
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user
class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model=Skill
        fields='__all__'
class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ['id', 'course', 'institution', 'start_date', 'end_date']

class CareerGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = CareerGoal
        fields = ['id', 'title', 'description', 'target_date']

from .models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'message', 'timestamp']
        

    