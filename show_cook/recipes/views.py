from django.shortcuts import get_list_or_404, get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Recipe, Ingredient
from .serializers import RecipeSerializer
from rest_framework import status


@api_view(['GET'])
def get_all_recipes(request):
    """
    Получить список всех рецептов.
    """
    recipes = Recipe.objects.all()
    serializer = RecipeSerializer(recipes, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_recipes_by_ingredients(request):
    """
    Получить рецепты, содержащие указанные ингредиенты.
    Пример запроса: GET /api/recipes/?ingredients=яблоко,молоко
    """
    ingredient_names = request.GET.get('ingredients', '').split(',')
    ingredients = Ingredient.objects.filter(name__in=ingredient_names)

    if not ingredients:
        return Response({"message": "Нет подходящих рецептов"}, status=404)

    recipes = Recipe.objects.filter(ingredients__in=ingredients).distinct()
    serializer = RecipeSerializer(recipes, many=True)

    return Response(serializer.data)


@api_view(['POST'])
def create_recipe(request):
    """Создание нового рецепта"""
    serializer = RecipeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def update_recipe(request, recipe_id):
    """Обновление существующего рецепта"""
    recipe = get_object_or_404(Recipe, id=recipe_id)
    serializer = RecipeSerializer(recipe, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
def delete_recipe(request, recipe_id):
    """Удаление рецепта"""
    recipe = get_object_or_404(Recipe, id=recipe_id)
    recipe.delete()
    return Response({"message": "Рецепт удалён"}, status=status.HTTP_204_NO_CONTENT)
