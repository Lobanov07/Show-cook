from rest_framework import generics, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Recipe, Ingredient, ProductPrice
from .serializers import RecipeSerializer
from rest_framework.schemas.openapi import AutoSchema
from rest_framework.views import APIView
import os
import subprocess
from django.core.exceptions import ObjectDoesNotExist

from asgiref.sync import sync_to_async
import requests
from django.core.management import call_command
from scrapy.cmdline import execute

from parsers.management.commands import parse_vkusvill_prices

# from .vision import recognize_products_from_image

def recognize_products_from_image():
    pass


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


class RecipeByIngredientsSchema(AutoSchema):
    def get_operation_id(self, path, method):
        return 'listRecipesByIngredients'


class RecipeByIngredientsView(generics.ListAPIView):
    """
    Класс для получения рецептов, содержащих указанные ингредиенты.
    Пример запроса: GET /api/recipes/by-ingredients/?ingredients=яблоко,молоко
    """
    serializer_class = RecipeSerializer

    schema = RecipeByIngredientsSchema()

    def get_queryset(self):
        ingredient_names = self.request.GET.get('ingredients', '').split(',')
        ingredients = Ingredient.objects.filter(name__in=ingredient_names)

        if not ingredients:
            return Recipe.objects.none()

        return Recipe.objects.filter(ingredients__in=ingredients).distinct()[:10]


class RecipesByProductsWithPriceView(APIView):
    def post(self, request):
        products = []

        image = request.FILES.get('image')
        if image:
            products = recognize_products_from_image(image)
        else:
            products = request.data.get('products', [])

        if not products:
            return Response({'error': 'No products provided'}, status=status.HTTP_400_BAD_REQUEST)

        products = [p.strip().capitalize() for p in products if p.strip()]

        ingredients_param = ",".join(products)

        url = f"http://127.0.0.1:8000/api/recipes/by-ingredients/?ingredients={ingredients_param}"

        try:
            response = requests.get(url)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return Response({'error': f"Error fetching recipes: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        matching_recipes = response.json()

        if not matching_recipes:
            return Response({'error': 'No matching recipes found'}, status=status.HTTP_404_NOT_FOUND)

        recipes_with_prices = []
        for recipe in matching_recipes:

            total_price = self.calculate_recipe_price(recipe)  # Ваша логика расчета цены
            recipes_with_prices.append((recipe, total_price))
            print(total_price)

        recipes_with_prices.sort(key=lambda x: x[1] if x[1] is not None else float('inf'))

        result = [
            {
                'recipe': recipe,
                'price': price
            }
            for recipe, price in recipes_with_prices
        ]

        return Response(result, status=status.HTTP_200_OK)

    def calculate_recipe_price(self, recipe_data):
        total_price = 0
        for recipe_ingredient in recipe_data['ingredients']:
            print(recipe_ingredient)
            ingredient_name = recipe_ingredient['ingredient']
            price = self.get_price_for_product(ingredient_name)
            if price is not None:
                total_price += price
        return total_price

    def set_price(self, product_name):
        """Запускает парсер Scrapy для поиска цен по продукту в фоновом процессе."""
        try:
            print(f"Ищем цены на: {product_name}")

            project_dir = "D:/dev/Show-cook/show_cook/parsers/prices_parser"

            if not os.path.exists(project_dir):
                raise FileNotFoundError(f"Директория не найдена: {project_dir}")

            os.chdir(os.path.abspath(project_dir))

            subprocess.Popen(["scrapy", "crawl", "vkusvill", "-a", f"query={product_name}"])

            print(f"Парсер запущен для {product_name}")
        except Exception as e:
            print(f"Ошибка при запуске парсера для {product_name}: {e}")
            raise

    def get_price_for_product(self, product_name):
        """Ищет цену продукта в базе данных. Если не находит — запускает парсер."""
        try:

            product_price = ProductPrice.objects.filter(
                name__icontains=product_name
            ).order_by('price').first()

            if product_price:
                return product_price.price
            else:
                print(f"Цена не найдена для {product_name}. Запускаем парсер.")

                self.set_price(product_name=product_name)

                product_price_list = list(ProductPrice.objects.filter(
                    name__icontains=product_name
                ).order_by('price'))

                if product_price_list:
                    return product_price_list[0].price
                else:
                    print(f"Не удалось найти цену для {product_name} после парсинга.")
                    return None
        except Exception as e:
            print(f"Ошибка при получении цены для продукта {product_name}: {e}")
            return None
