from rest_framework import generics, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Recipe, Ingredient, ProductPrice
from .serializers import RecipeSerializer
from rest_framework.schemas.openapi import AutoSchema
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
import requests
from os import chdir
from os.path import isdir
import subprocess

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.schemas import AutoSchema

from recipes.models import Recipe, Ingredient, ProductPrice
from recipes.serializers import RecipeSerializer
from recipes.tasks import crawl_price_for
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

import os
import logging
import numpy as np
import cv2
from ultralytics import YOLO
from django.conf import settings

logger = logging.getLogger(__name__)

# Пусть к модели берётся из настроек, или fallback на None
MODEL_PATH = getattr(settings, 'YOLO_MODEL_PATH', None)
_model = None

# Инициализация модели при первом вызове
def _load_model():
    global _model
    if _model is not None:
        return
    if not MODEL_PATH or not os.path.isfile(MODEL_PATH):
        logger.error(f"YOLO model file not found: {MODEL_PATH}")
        _model = None
        return
    try:
        _model = YOLO(MODEL_PATH)
        logger.info(f"YOLO model loaded from {MODEL_PATH}")
    except Exception as e:
        logger.exception(f"Failed to load YOLO model: {e}")
        _model = None


def recognize_products_from_image(image_file) -> list[str]:
    """
    Распознаёт продукты на изображении с помощью модели YOLOv8.
    Возвращает список уникальных меток.
    Если модель не загружена или файл некорректен — возвращает пустой список.
    """
    _load_model()
    if _model is None:
        return []

    try:
        # Читаем байты изображения
        image_file.seek(0)
        img_bytes = image_file.read()
        arr = np.frombuffer(img_bytes, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            logger.warning("Failed to decode image for recognition")
            return []

        # Инференс
        results = _model(img)
        detected = set()
        for res in results:
            for box in res.boxes:
                cls_id = int(box.cls[0])
                name = res.names.get(cls_id)
                if name:
                    detected.add(name)
        return list(detected)

    except Exception as e:
        logger.exception(f"Error during image recognition: {e}")
        return []



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

        return queryset.distinct().order_by('id')

    def get_operation_id(self, path, method):
        return 'listRecipesByIngredients'







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
    или multipart/form-data с image + sort_by.
    Возвращает пагинированный список рецептов с ценой недостающих продуктов и релевантностью.
    """
    schema = AutoSchema()
    pagination_class = PageNumberPagination  # по умолчанию page_size=10

    def post(self, request):
        # 1) Получаем входные продукты
        image = request.FILES.get('image')
        raw = (
            recognize_products_from_image(image)
            if image
            else request.data.get('products', [])
        )
        products = [p.strip().capitalize() for p in raw if isinstance(p, str) and p.strip()]
        if not products:
            return Response({'error': 'No products provided'}, status=status.HTTP_400_BAD_REQUEST)

        # 2) Собираем леммы для релевантности
        input_lemmas = set()
        for p in products:
            input_lemmas |= get_lemmas(p)

        # 3) Читаем параметр сортировки
        sort_by = request.data.get('sort_by', 'price')
        if sort_by not in ('price', 'relevance'):
            return Response({'error': 'Invalid sort_by'}, status=status.HTTP_400_BAD_REQUEST)

        # 4) Фильтруем рецепты по ингредиентам и делаем prefetch
        qs = Recipe.objects.all().prefetch_related('ingredients')
        for name in products:
            qs = qs.filter(ingredients__name__icontains=name)
        qs = qs.distinct().order_by('id')

        # 5) Пагинируем сразу QuerySet
        paginator = self.pagination_class()
        page_qs = paginator.paginate_queryset(qs, request, view=self)
        if not page_qs:
            return Response({'error': 'No matching recipes found'}, status=status.HTTP_404_NOT_FOUND)

        # 6) Собираем matched/missing для этой страницы
        all_missing = set()
        metas = []
        for rec in page_qs:
            names = [ing.name.strip() for ing in rec.ingredients.all()]
            matched = [n for n in names if get_lemmas(n) & input_lemmas]
            missing = [n for n in names if n not in matched]
            all_missing |= set(missing)
            metas.append({'recipe_obj': rec, 'matched': matched, 'missing': missing, 'total': len(names)})

        # 7) Bulk-запрос цен из БД
        price_map = {pp.name: pp.price for pp in ProductPrice.objects.filter(name__in=all_missing).order_by('price')}

        # 8) Запускаем парсер для отсутствующих цен
        for name in all_missing:
            if name not in price_map:
                try:
                    crawl_price_for.delay(name)
                except Exception:
                    project_dir = "D:/dev/Show-cook/show_cook/parsers/prices_parser"
                    if isdir(project_dir):
                        chdir(project_dir)
                        subprocess.Popen([
                            "scrapy", "crawl", "vkusvill", "-a", f"query={name}"
                        ])

        # 9) Формируем output и сериализуем
        output = []
        for m in metas:
            rec = m['recipe_obj']
            rec_data = RecipeSerializer(rec).data
            total_price = sum(price_map.get(n, 0) for n in m['missing'])
            relevance = (len(m['matched']) / m['total'] * 100) if m['total'] else 0
            output.append({'recipe': rec_data, 'price': round(total_price, 2), 'relevance': round(relevance, 1)})

        # 10) Сортируем
        if sort_by == 'price':
            output.sort(key=lambda x: x['price'])
        else:
            output.sort(key=lambda x: x['relevance'], reverse=True)

        # 11) Возвращаем paginated response
        return paginator.get_paginated_response(output)
