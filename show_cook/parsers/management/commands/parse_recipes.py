from django.core.management.base import BaseCommand
from parsers.utils import parse_povarenok_recipe
from parsers.services import save_recipe_to_db


class Command(BaseCommand):
    help = "Парсинг рецептов с povarenok.ru"

    def handle(self, *args, **options):
        urls = [
            "https://www.povarenok.ru/recipes/show/91208/"
        ]

        for url in urls:
            recipe_data = parse_povarenok_recipe(url)
            if recipe_data:
                save_recipe_to_db(recipe_data)
                self.stdout.write(self.style.SUCCESS(f"Добавлен рецепт: {recipe_data['title']}"))
            else:
                self.stdout.write(self.style.ERROR(f"Ошибка парсинга {url}"))