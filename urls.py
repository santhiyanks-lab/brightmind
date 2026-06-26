from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.voice_chat),  # POST audio → get text + audio back
]