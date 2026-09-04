from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_room, name='create_room'),
    path('join/', views.join_room, name='join_room'),
    path('sync/<str:room_code>/', views.sync_room, name='sync_room'),
    path('submit/', views.submit_code, name='submit_code'),
    path('flee/', views.flee_room, name='flee_room'),
]
