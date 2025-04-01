from rest_framework import generics, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Recipe, Ingredient
from .serializers import RecipeSerializer


class RecipeListCreateView(generics.ListCreateAPIView):
    """
    Класс для создания и просмотра списка рецептов.
    """
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer


class RecipeRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Класс для получения, обновления и удаления одного рецепта по ID.
    """
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    lookup_field = 'id'


class RecipeByIngredientsView(generics.ListAPIView):
    """
    Класс для получения рецептов, содержащих указанные ингредиенты.
    Пример запроса: GET /api/recipes/by-ingredients/?ingredients=яблоко,молоко
    """
    serializer_class = RecipeSerializer

    def get_queryset(self):
        ingredient_names = self.request.GET.get('ingredients', '').split(',')
        ingredients = Ingredient.objects.filter(name__in=ingredient_names)

        if not ingredients:
            return Recipe.objects.none()

        return Recipe.objects.filter(ingredients__in=ingredients).distinct()
