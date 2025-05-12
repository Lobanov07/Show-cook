from django.core.management.base import BaseCommand
from parsers.utils import parse_povarenok_recipe
from parsers.services import save_recipe_to_db
from concurrent.futures import ThreadPoolExecutor


class Command(BaseCommand):
    help = "Парсинг рецептов с povarenok.ru"

    def handle(self, *args, **options):

        urls = [f"https://www.povarenok.ru/recipes/show/{x}/" for x in range(200, 1000)]

        def process_url(url):
            recipe_data = parse_povarenok_recipe(url)
            if recipe_data:
                save_recipe_to_db(recipe_data)
                self.stdout.write(
                    self.style.SUCCESS(f"Добавлен рецепт: {recipe_data['title']}")
                )
            else:
                self.stdout.write(self.style.ERROR(f"Ошибка парсинга {url}"))


        with ThreadPoolExecutor(
            max_workers=10
        ) as executor:
            executor.map(process_url, urls)
