from django.urls import path
from . import views
urlpatterns = [
    path("question/", views.get_question),
    path("answer/",   views.check_answer),
]