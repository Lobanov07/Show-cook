from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password
import base64

from django.core.files.base import ContentFile


class Base64ImageField(serializers.ImageField):
    """Кастомное поле для кодирования изображения в base64."""

    def to_internal_value(self, data):
        """Метод преобразования картинки."""
        if isinstance(data, str) and data.startswith('data:image'):
            format, imgstr = data.split(';base64,')
            ext = format.split('/')[-1]
            data = ContentFile(base64.b64decode(imgstr), name='photo.' + ext)

        return super().to_internal_value(data)


class UserSerializer(serializers.ModelSerializer):
    photo = Base64ImageField(
        max_length=None, use_url=True,
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'photo', 'date_of_birth', 'phone_number']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'date_of_birth', 'phone_number']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Пароли не совпадают.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
