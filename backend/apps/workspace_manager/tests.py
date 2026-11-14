from django.test import TestCase
from rest_framework.test import APIClient

class WorkspaceSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_path_traversal_blocked(self):
        # Path traversal should be rejected with HTTP 403 Forbidden
        res = self.client.get('/api/workspace/file/?path=../../etc/passwd')
        self.assertEqual(res.status_code, 403)

    def test_empty_workspace_tree(self):
        res = self.client.get('/api/workspace/tree/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('tree', res.data)
