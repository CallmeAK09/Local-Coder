from rest_framework.views import APIView
from rest_framework.response import Response
from .checker import check_all_dependencies

class DependencyStatusView(APIView):
    """
    Checks the status of all supported language compilers/interpreters on the host system.
    """
    def get(self, request):
        status_info = check_all_dependencies()
        return Response(status_info)
