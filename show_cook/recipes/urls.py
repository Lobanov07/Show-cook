from django.urls import path
from .views import create_recipe, update_recipe, delete_recipe

urlpatterns = [
    path('recipes/', create_recipe, name='create_recipe'),
    path('recipes/<int:recipe_id>/', update_recipe, name='update_recipe'),
    path('recipes/<int:recipe_id>/delete/', delete_recipe, name='delete_recipe'),
]
