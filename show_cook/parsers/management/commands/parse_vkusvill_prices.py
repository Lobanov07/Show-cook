from django.core.management.base import BaseCommand
from scrapy.cmdline import execute
import os
import sys

class Command(BaseCommand):
    help = "Парсит цены с ВкусВилл"

    def add_arguments(self, parser):
        parser.add_argument("query", type=str, help="Название продукта")

    def handle(self, *args, **kwargs):
        query = kwargs["query"]
        self.stdout.write(f"Ищем цены на: {query}")

        # Формируем путь к prices_parser (поднимаемся на 2 уровня вверх)
        project_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'prices_parser')
        # Проверяем, существует ли директория
        if not os.path.exists(project_dir):
            raise FileNotFoundError(f"Директория не найдена: {project_dir}")
        os.chdir(project_dir)
        execute(["scrapy", "crawl", "vkusvill", "-a", f"query={query}"])