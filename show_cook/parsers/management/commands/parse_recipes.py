from concurrent.futures import ThreadPoolExecutor

from django.core.management.base import BaseCommand
from parsers.services import save_recipe_to_db
from parsers.utils import parse_povarenok_recipe


class Command(BaseCommand):
    help = "Парсинг рецептов с povarenok.ru"

    def handle(self, *args, **options):

        urls = [
            f"https://www.povarenok.ru/recipes/show/{x}/"
            for x in range(1, 100)]

        def process_url(url):
            recipe_data = parse_povarenok_recipe(url)
            if recipe_data:
                save_recipe_to_db(recipe_data)
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Добавлен рецепт: {recipe_data['title']}")
                )
            else:
                self.stdout.write(self.style.ERROR(f"Ошибка парсинга {url}"))

        with ThreadPoolExecutor(
            max_workers=10
        ) as executor:
            executor.map(process_url, urls)
