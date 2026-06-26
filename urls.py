from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/chat/',     include('chat.urls')),
    path('api/stories/',  include('stories.urls')),
    path('api/games/',    include('games.urls')),    # ← was missing
    path('api/learn/',    include('learn.urls')),
    path('api/creative/', include('creative.urls')), # ← was missing
    path('api/outdoor/',  include('outdoor.urls')),
    path('api/voice_chat/',  include('voice_chat.urls')), 
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)