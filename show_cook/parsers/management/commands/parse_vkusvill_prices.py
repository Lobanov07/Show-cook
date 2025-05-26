import logging
import os

from django.core.management.base import BaseCommand
from scrapy.cmdline import execute


class Command(BaseCommand):
    help = "Парсит цены с ВкусВилл"

    def add_arguments(self, parser):
        parser.add_argument("query", type=str, help="Название продукта")

    def handle(self, *args, **kwargs):
        query = kwargs["query"]
        self.stdout.write(f"Ищем цены на: {query}")

        project_dir = os.path.join(
            os.path.dirname(__file__), '..', '..', 'prices_parser')

        if not os.path.exists(project_dir):
            raise FileNotFoundError(f"Директория не найдена: {project_dir}")
        os.chdir(project_dir)

        try:

            self.stdout.write(f"Запуск парсинга для продукта: {query}")

            execute(["scrapy", "crawl", "vkusvill", "-a", f"query={query}"])
        except Exception as e:
            logging.error(f"Ошибка при выполнении парсинга: {e}")
            self.stderr.write(f"Ошибка при выполнении парсинга: {e}")

            logging.exception("Полная трассировка ошибки:")
