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
from django.db.models import Q



from asgiref.sync import sync_to_async
import requests
from django.core.management import call_command


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

    def get_queryset(self):
        ingredient_names = self.request.GET.get('ingredients', '').split(',')
        ingredient_names = [name.strip() for name in ingredient_names if name.strip()] 
        if not ingredient_names:
            return Recipe.objects.none()

        queryset = Recipe.objects.all()


        for name in ingredient_names:

            ingredients = Ingredient.objects.filter(name__icontains=name)
            if not ingredients:
                return Recipe.objects.none()  
            queryset = queryset.filter(ingredients__in=ingredients)

        return queryset.distinct()#[:10]
    
    def get_operation_id(self, path, method):
        return 'listRecipesByIngredients'





import inspect
from collections import namedtuple
import re
import requests

from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.schemas import AutoSchema

from .models import ProductPrice
from .tasks import crawl_price_for

ArgSpec = namedtuple('ArgSpec', ['args', 'varargs', 'varkw', 'defaults'])
def _getargspec(func):
    full = inspect.getfullargspec(func)
    return ArgSpec(full.args, full.varargs, full.varkw, full.defaults)
inspect.getargspec = _getargspec

import pymorphy2
morph = pymorphy2.MorphAnalyzer()

def get_lemmas(text: str) -> set[str]:
    tokens = re.findall(r'\w+', text.lower(), flags=re.UNICODE)
    return { morph.parse(tok)[0].normal_form for tok in tokens }


class RecipesByProductsWithPriceView(APIView):
    """
    POST /api/recipes-with-prices/
    Принимает JSON { products: [...], sort_by: "price"|"relevance" }
    или multipart/form-data с image + sort_by
    Отдаёт список рецептов с ценой недостающих продуктов и релевантностью.
    """
    schema = AutoSchema()

    def post(self, request):
        # 1) Получаем список входных продуктов
        image = request.FILES.get('image')
        raw = (recognize_products_from_image(image)
               if image else request.data.get('products', []))
        products = [
            p.strip().capitalize()
            for p in raw
            if isinstance(p, str) and p.strip()
        ]
        if not products:
            return Response({'error': 'No products provided'},
                            status=status.HTTP_400_BAD_REQUEST)

        # 2) Собираем леммы входных продуктов
        input_lemmas = set()
        for p in products:
            input_lemmas |= get_lemmas(p)

        # 3) Читаем параметр сортировки
        sort_by = request.data.get('sort_by', 'price')
        if sort_by not in ('price', 'relevance'):
            return Response({'error': 'Invalid sort_by'},
                            status=status.HTTP_400_BAD_REQUEST)

        # 4) Получаем список рецептов по ингредиентам
        try:
            resp = requests.get(
                'http://127.0.0.1:8000/api/recipes/by-ingredients/',
                params={'ingredients': ",".join(products)}
            )
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            return Response({'error': f"Error fetching recipes: {e}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Поддержка пагинации DRF
        if isinstance(data, dict) and 'results' in data:
            matching = data['results']
        elif isinstance(data, list):
            matching = data
        else:
            return Response(
                {'error': 'Unexpected data format from by-ingredients'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        if not matching:
            return Response({'error': 'No matching recipes found'},
                            status=status.HTTP_404_NOT_FOUND)

        # 5) Составляем список всех недостающих ингредиентов и метаданные по рецептам
        all_missing = set()
        metas = []
        for rec in matching:
            ing_list = rec.get('ingredients') or []
            if not isinstance(ing_list, list):
                ing_list = [ing_list]

            names = []
            for ing in ing_list:
                if isinstance(ing, dict):
                    name = ing.get('ingredient') or ing.get('name') or ''
                else:
                    name = str(ing)
                name = name.strip()
                if name:
                    names.append(name)

            matched = [n for n in names if get_lemmas(n) & input_lemmas]
            missing = [n for n in names if n not in matched]

            all_missing |= set(missing)
            metas.append({
                'recipe': rec,
                'matched': matched,
                'missing': missing,
                'total': len(names),
            })

        # 6) Пакетно тянем из БД цены тех, что уже есть
        price_map = {}
        for name in all_missing:
            qp = (
                ProductPrice.objects
                .filter(name__icontains=name)
                .order_by('price')
                .first()
            )
            if qp:
                price_map[name] = qp.price

        # 7) Запускаем парсер для тех, у кого не нашлось цены в БД
        for name in all_missing:
            has_price = ProductPrice.objects.filter(name__icontains=name).exists()
            if not has_price:
                try:
                    crawl_price_for.delay(name)
                except Exception as e:
                    print(f"[Warning] Cannot enqueue parser for '{name}': {e}")
                    try:
                        self.set_price(name)
                    except Exception as ie:
                        print(f"[Error] Local parser failed for '{name}': {ie}")

        output = []
        for m in metas:
            total_price = sum(price_map.get(n, 0) for n in m['missing'])
            relevance = (len(m['matched']) / m['total'] * 100) if m['total'] else 0
            output.append({
                'recipe': m['recipe'],
                'price': round(total_price, 2),
                'relevance': round(relevance, 1),
            })

        if sort_by == 'price':
            output.sort(key=lambda x: x['price'])
        else:
            output.sort(key=lambda x: x['relevance'], reverse=True)

        return Response(output, status=status.HTTP_200_OK)

    def set_price(self, product_name: str):
        """
        Локальный запуск Scrapy-парсера для обновления цены продукта.
        """
        import os, subprocess
        project_dir = "C:\easyproject\Show-cook\show_cook\parsers\prices_parcer"
        if not os.path.isdir(project_dir):
            raise FileNotFoundError(f"Dir not found: {project_dir}")
        os.chdir(project_dir)
        subprocess.Popen([
            "scrapy", "crawl", "vkusvill", "-a", f"query={product_name}"
        ])

    def get_price_for_product(self, product_name: str) -> float | None:
        """Пытаемся взять цену из БД, иначе запускаем парсер."""
        try:
            qp = ProductPrice.objects.filter(
                name__icontains=product_name
            ).order_by('price').first()
            if qp:
                return qp.price

            self.set_price(product_name)
            next_qs = ProductPrice.objects.filter(
                name__icontains=product_name
            ).order_by('price')
            if next_qs.exists():
                return next_qs.first().price
        except Exception:
            pass
        return None
