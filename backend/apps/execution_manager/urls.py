from django.urls import path
from .views import ExecuteCodeView, StopExecutionView, ExecutionHistoryView

urlpatterns = [
    path('run/', ExecuteCodeView.as_view(), name='execute-run'),
    path('stop/', StopExecutionView.as_view(), name='execute-stop'),
    path('history/', ExecutionHistoryView.as_view(), name='execute-history'),
]

