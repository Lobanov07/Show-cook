from rest_framework.authtoken.views import obtain_auth_token

from django.urls import path
from .views import RegisterView, ProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('login/', obtain_auth_token, name='login'),
]
