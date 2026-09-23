
from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView
urlpatterns=[
    path('getprofiles/',views.get_profiles,name="getprofiles"),
    path('myprofile/', views.my_profile, name="myprofile"),
    path('createprofile/',views.create_profile,name="createprofile"),
    path('updateprofile/<int:pk>/',views.update_profile,name="updateprofile"),
    path('deleteprofile/<int:pk>/',views.delete_profile,name="deleteprofile"),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/',views.register,name="register"),
    path('addskills/',views.add_skills,name="addskills"),
    path('addeducation/',views.add_education,name="addeducation"),
    path('addcarrergoal/',views.add_carrer_goal,name="addcarrergoal"),
    path('removeskill/<int:pk>/', views.remove_skill, name="removeskill"),
    path('education/<int:pk>/', views.manage_education, name="manageeducation"),
    path('careergoal/<int:pk>/', views.manage_career_goal, name="managecareergoal"),
    path('roadmap/', views.generate_roadmap, name="roadmap"),
    path('chat/send/', views.send_chat_message, name="sendchat"),
    path('chat/history/', views.get_chat_history, name="chathistory"),
    path('career-dna/', views.carrer_dna, name="career_dna"),   # ✅ Fixed typo: carrer → career
    path('skills_gap/', views.skill_gaps, name="skills_gap"),
    path('interview/start/', views.start_interview, name="start_interview"),
    path('interview/answer/', views.submit_answer, name="submit_answer"),
    path('interview/end/', views.end_interview, name="end_interview"),
    path('interview/last/', views.get_last_interview, name="get_last_interview"),
    # GitHub
    path('github/link/', views.link_github, name="link_github"),
    path('github/unlink/', views.unlink_github, name="unlink_github"),
    path('github/analyze/', views.analyze_github, name="analyze_github"),
    # Resume
    path('resume/upload/', views.upload_resume, name="upload_resume"),
    path('resume/analysis/', views.get_resume_analysis, name="get_resume_analysis"),
    # LinkedIn
    path('linkedin/link/', views.link_linkedin, name="link_linkedin"),
    # Profile
    path('profile/update/', views.update_my_profile, name="update_my_profile"),
    # Password Reset
    path('password/reset/', views.request_password_reset, name="request_password_reset"),
    path('password/reset/confirm/', views.confirm_password_reset, name="confirm_password_reset"),
]