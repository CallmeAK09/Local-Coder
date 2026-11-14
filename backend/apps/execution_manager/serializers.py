from rest_framework import serializers
from .models import ExecutionHistory

class ExecutionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExecutionHistory
        fields = '__all__'

