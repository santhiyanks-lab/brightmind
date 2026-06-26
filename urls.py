from django.urls import path
from . import views

urlpatterns = [
    path('message/', views.chat, name='message'),
    path('voice/', views.voice_chat, name='voice'),
]
