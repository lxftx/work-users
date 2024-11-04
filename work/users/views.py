from django.views.generic import TemplateView
from rest_framework import viewsets

from users.models import Position, User
from users.serializers import PositionSerializer, UserSerializer, UserUpdateSerializer
from users.filters import UserFilter
from users.permissions import IsAdminOrReadOnly, IsEditorOrAdmin, IsReadOnly, IsNotIntern

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth import authenticate


class IndexView(TemplateView):
    template_name = 'users/index.html'

class PositionViewSet(viewsets.ModelViewSet):
    permission_classes = (IsNotIntern,)

    queryset = Position.objects.all()
    serializer_class = PositionSerializer


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAdminOrReadOnly, IsEditorOrAdmin, IsReadOnly)

    queryset = User.objects.all()
    serializer_class = UserSerializer
    filterset_class = UserFilter

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(email=email, password=password)

        if user is None or user.is_dismissed:
            return Response({'detail': 'Вы больше не имеете доступа!'}, status=status.HTTP_403_FORBIDDEN)

        return super().post(request, *args, **kwargs)
