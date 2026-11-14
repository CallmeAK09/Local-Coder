from django.urls import path
from .views import DependencyStatusView

urlpatterns = [
    path('status/', DependencyStatusView.as_view(), name='dependency-status'),
]

