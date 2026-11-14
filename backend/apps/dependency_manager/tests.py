from django.test import TestCase
from rest_framework.test import APIClient

class DependencyManagerAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_dependency_status_structure(self):
        res = self.client.get('/api/dependencies/status/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('all_ready', res.data)
        self.assertIn('dependencies', res.data)
        self.assertIn('os', res.data)

        # Check that python and node dependencies are returned
        dep_ids = [d['id'] for d in res.data['dependencies']]
        self.assertIn('python', dep_ids)
        self.assertIn('node', dep_ids)
        self.assertIn('gcc', dep_ids)
        self.assertIn('java', dep_ids)
