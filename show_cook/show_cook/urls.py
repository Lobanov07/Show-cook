from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("recipes.urls")),
    path("users/", include("users.urls")),
    path('', TemplateView.as_view(template_name='index.html'), name="index"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
