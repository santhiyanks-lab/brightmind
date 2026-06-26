from django.urls import path
from . import views

urlpatterns = [
    path('register/parent/', views.parent_register),
    path('add-child/',       views.add_child),
    path('login/',           views.login_view),
    path('me/',              views.me),  
]