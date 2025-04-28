from django.core.management.base import BaseCommand
from parsers.utils import parse_povarenok_recipe
from parsers.services import save_recipe_to_db
from concurrent.futures import ThreadPoolExecutor


class Command(BaseCommand):
    help = "Парсинг рецептов с povarenok.ru"

    def handle(self, *args, **options):
        # Список всех URL-ов рецептов
        urls = [f"https://www.povarenok.ru/recipes/show/{x}/" for x in range(1,200)]

        # Функция для обработки каждого URL
        def process_url(url):
            recipe_data = parse_povarenok_recipe(url)
            if recipe_data:
                save_recipe_to_db(recipe_data)
                self.stdout.write(
                    self.style.SUCCESS(f"Добавлен рецепт: {recipe_data['title']}")
                )
            else:
                self.stdout.write(self.style.ERROR(f"Ошибка парсинга {url}"))

        # Использование ThreadPoolExecutor для параллельной обработки URL-ов
        with ThreadPoolExecutor(
            max_workers=10
        ) as executor:  # Количество потоков можно настроить
            executor.map(process_url, urls)


# class Command(BaseCommand):
#     help = "Парсинг рецептов с povarenok.ru"

#     def handle(self, *args, **options):
#         urls = [
#             "https://www.povarenok.ru/recipes/show/91208/"
#         ]

#         for url in urls:
#             recipe_data = parse_povarenok_recipe(url)
#             if recipe_data:
#                 save_recipe_to_db(recipe_data)
#                 self.stdout.write(self.style.SUCCESS(f"Добавлен рецепт: {recipe_data['title']}"))
#             else:
#                 self.stdout.write(self.style.ERROR(f"Ошибка парсинга {url}"))
