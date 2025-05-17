from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = BaseUserAdmin.list_display + ('photo_tag',)
    readonly_fields = BaseUserAdmin.readonly_fields + ('photo_tag',)
    fieldsets = BaseUserAdmin.fieldsets + (
        (None, {'fields': ('photo', 'photo_tag')}),
    )
