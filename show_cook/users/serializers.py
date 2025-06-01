from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password
import base64
from django.core.files.base import ContentFile
from django.conf import settings


class Base64ImageField(serializers.ImageField):
    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith('data:image'):
            fmt, imgstr = data.split(';base64,')
            ext = fmt.split('/')[-1]
            data = ContentFile(base64.b64decode(imgstr), name='photo.' + ext)
        return super().to_internal_value(data)


class UserSerializer(serializers.ModelSerializer):
    # Прием Base64-картинки или стандартная загрузка файла
    photo = Base64ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'photo', 'date_of_birth', 'phone_number']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.photo:
            data['photo'] = instance.photo.url  # вернёт "/media/папка/файл.jpg"
        return data


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
