from pathlib import Path
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings
from .views import (
    index_view,
    browser_proxy_view,
    offline_docs_view,
    pwa_or_spa_serve,
    server_stop_view,
    server_heartbeat_view,
    server_client_leave_view,
    pwa_sync_view
)

DIST_DIR = settings.BASE_DIR.parent / 'frontend' / 'dist'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/server/stop/', server_stop_view, name='server_stop'),
    path('api/server/heartbeat/', server_heartbeat_view, name='server_heartbeat'),
    path('api/server/client-leave/', server_client_leave_view, name='server_client_leave'),
    path('api/pwa/sync/', pwa_sync_view, name='pwa_sync'),
    path('api/workspace/', include('apps.workspace_manager.urls')),
    path('api/execute/', include('apps.execution_manager.urls')),
    path('api/dependencies/', include('apps.dependency_manager.urls')),
    path('api/browser/proxy/', browser_proxy_view, name='browser_proxy'),
    path('api/browser/docs/', offline_docs_view, name='offline_docs'),
    
    # Static assets serving for offline built frontend
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': DIST_DIR / 'assets'}),
    
    # Root, PWA assets (manifest.json, sw.js, pwa-*.png) & SPA routing fallback
    re_path(r'^(?P<path>.*)$', pwa_or_spa_serve, name='pwa_spa_serve'),
]
