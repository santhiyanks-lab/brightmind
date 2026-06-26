from django.urls import path
from . import views

urlpatterns = [
    path('topics/',  views.get_topics),
    path('start/',   views.start_quiz),
    path('answer/',  views.answer_quiz),
]