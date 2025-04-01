from django.urls import path
from .views import RecipeListCreateView, RecipeRetrieveUpdateDestroyView, RecipeByIngredientsView

urlpatterns = [
    path('recipes/', RecipeListCreateView.as_view(), name='recipe-list-create'),
    path('recipes/<int:id>/', RecipeRetrieveUpdateDestroyView.as_view(), name='recipe-detail'),
    path('recipes/by-ingredients/', RecipeByIngredientsView.as_view(), name='recipe-by-ingredients'),
]
