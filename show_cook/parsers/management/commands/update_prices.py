import os
import subprocess

from django.core.management.base import BaseCommand
from recipes.models import Ingredient, ProductPrice


class Command(BaseCommand):
    help = "Получение цены для всех ингредиентов: парсером или вручную"

    def handle(self, *args, **options):
        project_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__),
                         '..', '..', 'prices_parser', 'prices_parser')
        )
        if not os.path.exists(project_dir):
            self.stderr.write(
                f"Директория с парсером не найдена: {project_dir}")
            return

        ingredient_names = (
            Ingredient.objects
            .values_list('name', flat=True)
            .distinct()
        )

        for name in ingredient_names:
            self.stdout.write(f"\nОбрабатываем ингредиент: «{name}»")

            if ProductPrice.objects.filter(name__icontains=name).exists():
                self.stdout.write(
                    self.style.SUCCESS("Цена уже есть в БД, пропускаем."))
                continue

            os.chdir(project_dir)
            try:
                subprocess.run(
                    ["scrapy", "crawl", "vkusvill", "-a", f"query={name}"],
                    check=True,
                    stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT
                )
                self.stdout.write("Scrapy-парсер отработал.")
            except subprocess.CalledProcessError as e:
                self.stderr.write(f"Ошибка запуска парсера: {e}")

            qs = ProductPrice.objects.filter(
                name__icontains=name).order_by('price')
            if qs.exists():
                price = qs.first().price
                self.stdout.write(self.style.SUCCESS(
                    f"Парсер вернул цену: {price}"))
                continue

            self.stdout.write("Не удалось получить цену парсером.")
            while True:
                val = input(
                    f"Введите цену для «{name}» (или напишите skip): ").strip()
                if val.lower() == 'skip':
                    self.stdout.write("Пропускаем этот ингредиент.")
                    break
                try:
                    price = float(val.replace(',', '.'))
                    ProductPrice.objects.create(name=name, price=price)
                    self.stdout.write(self.style.SUCCESS(
                        f"Ручная установка: {price}"))
                    break
                except ValueError:
                    self.stderr.write("Неверный формат числа, попробуйте ещё раз.")
