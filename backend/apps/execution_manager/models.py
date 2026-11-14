from django.db import models

class ExecutionHistory(models.Model):
    STATUS_CHOICES = [
        ('SUCCESS', 'Success'),
        ('ERROR', 'Error'),
        ('COMPILE_ERROR', 'Compilation Error'),
        ('TIMEOUT', 'Timeout'),
        ('TERMINATED', 'Terminated by User'),
    ]

    file_path = models.CharField(max_length=512)
    language = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    exit_code = models.IntegerField(null=True, blank=True)
    stdout = models.TextField(blank=True, default='')
    stderr = models.TextField(blank=True, default='')
    compilation_error = models.TextField(blank=True, default='')
    execution_time_ms = models.FloatField(default=0.0)
    stdin_input = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.language} - {self.file_path} ({self.status}) at {self.created_at}"
