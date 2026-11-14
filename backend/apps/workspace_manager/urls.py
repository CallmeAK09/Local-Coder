from django.urls import path, re_path
from .views import (
    WorkspaceTreeView,
    FileDetailView,
    CreateFolderView,
    RenameItemView,
    DeleteItemView,
    PreviewServeView
)

urlpatterns = [
    path('tree/', WorkspaceTreeView.as_view(), name='workspace-tree'),
    path('file/', FileDetailView.as_view(), name='workspace-file'),
    path('folder/', CreateFolderView.as_view(), name='workspace-folder'),
    path('rename/', RenameItemView.as_view(), name='workspace-rename'),
    path('delete/', DeleteItemView.as_view(), name='workspace-delete'),
    re_path(r'^preview/(?P<subpath>.*)$', PreviewServeView.as_view(), name='workspace-preview'),
]

