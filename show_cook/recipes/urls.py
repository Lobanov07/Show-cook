from django.urls import path
from .views import (RecipeListCreateView,
                    RecipeRetrieveUpdateDestroyView,
                    RecipeByIngredientsView,
                    RecipesByProductsWithPriceView)

urlpatterns = [
    path('recipes/', RecipeListCreateView.as_view(), name='recipe-list-create'),
    path('recipes/<int:id>/', RecipeRetrieveUpdateDestroyView.as_view(), name='recipe-detail'),
    path('recipes/by-ingredients/', RecipeByIngredientsView.as_view(), name='recipe-by-ingredients'),
    path('recipes-with-prices/', RecipesByProductsWithPriceView.as_view(), name='recipes-with-prices'),
]
