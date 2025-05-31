from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password
import base64
from django.core.files.base import ContentFile
from django.conf import settings

class Base64ImageField(serializers.ImageField):
    """
    Кастомное поле для загрузки картинки, закодированной в Base64.
    При приёме Base64-строки создаётся ContentFile, а после 
    super().to_internal_value() сохранит изображение в ImageField.
    """

    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith('data:image'):
            # Разбиваем например на "data:image/png" и "base64,XYZ..."
            format, imgstr = data.split(';base64,')
            ext = format.split('/')[-1]  # jpeg, png и т.п.
            data = ContentFile(base64.b64decode(imgstr), name='photo.' + ext)
        return super().to_internal_value(data)


class UserSerializer(serializers.ModelSerializer):
    # Поле photo – это либо сериализуемое ImageField, либо Base64ImageField
    # Мы будем отдавать в ответе _только_ относительный путь obj.photo.url
    photo = Base64ImageField(read_only=False, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'photo', 'date_of_birth', 'phone_number']

    def to_representation(self, instance):
        """
        При отдаче объекта (GET-запрос) будем изменять поле photo:
        вместо build_absolute_uri отдаём просто instance.photo.url → '/media/…'
        """
        data = super().to_representation(instance)
        photo_field = data.get('photo')
        if photo_field:
            # instance.photo.url уже возвращает '/media/путь_до_файла'
            data['photo'] = instance.photo.url
        return data

    def validate(self, attrs):
        """
        Если вы в будущем захотите проверять пароль или другие поля, 
        здесь можно разместить общие валидации.
        """
        return super().validate(attrs)

    def create(self, validated_data):
        """
        При создании пользователя можно прописать логику:
        validate_password(validated_data.get('password'))
        и т. д. (если у вас в модели есть password).
        Но предположим, что здесь просто super().
        """
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Если нужно, чтобы при обновлении пользователя 
        для поля photo использовалась Base64ImageField, 
        оставляем super().update().
        """
        return super().update(instance, validated_data)



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
