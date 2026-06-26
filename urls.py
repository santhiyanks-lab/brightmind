from django.urls import path
from . import views
urlpatterns = [
    path('themes/',   views.get_themes),
    path("start/",    views.start_story),
    path("continue/", views.continue_story),
]