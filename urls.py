from django.urls import path
from . import views

urlpatterns = [
    path('types/', views.get_creative_types),
    path('idea/',  views.get_idea),
    path('share/', views.share_creation),
]