from rest_framework import generics, permissions
from .models import User
from .serializers import RegisterSerializer, UserSerializer
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser


class RegisterView(generics.CreateAPIView):
    """
    Класс для регистрации пользователей.
    """

    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Класс для получения, обновления и удаления профиля пользователя.
    """

    parser_classes = (MultiPartParser, FormParser, JSONParser)
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
