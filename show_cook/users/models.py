from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.html import mark_safe


class User(AbstractUser):
    photo = models.ImageField(
        upload_to='profile_photos/',
        null=True,
        blank=True)
    phone_number = models.CharField(max_length=20, blank=True)

    date_of_birth = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.username

    def photo_tag(self):
        if self.photo:
            return mark_safe(f'<img src="{self.photo.url}" width="50" height="50" style="object-fit: cover;" />')
        return "-"
