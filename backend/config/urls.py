from pathlib import Path
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings
from .views import index_view, browser_proxy_view, offline_docs_view

DIST_DIR = settings.BASE_DIR.parent / 'frontend' / 'dist'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/workspace/', include('apps.workspace_manager.urls')),
    path('api/execute/', include('apps.execution_manager.urls')),
    path('api/dependencies/', include('apps.dependency_manager.urls')),
    path('api/browser/proxy/', browser_proxy_view, name='browser_proxy'),
    path('api/browser/docs/', offline_docs_view, name='offline_docs'),
    
    # Static assets serving for offline built frontend
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': DIST_DIR / 'assets'}),
    
    # Root SPA entry
    path('', index_view, name='index'),
]
