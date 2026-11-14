import tempfile
import os
from pathlib import Path
from django.test import TestCase
from rest_framework.test import APIClient
from apps.execution_manager.models import ExecutionHistory
from apps.execution_manager.runner import execute_code

class ExecutionManagerAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_history_model(self):
        item = ExecutionHistory.objects.create(
            file_path="main.py",
            language="python",
            status="SUCCESS",
            exit_code=0,
            stdout="test output",
            execution_time_ms=12.5
        )
        self.assertEqual(item.status, "SUCCESS")
        self.assertEqual(item.language, "python")
