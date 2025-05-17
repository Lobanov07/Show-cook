from celery import shared_task
import os
import subprocess

@shared_task
def crawl_price_for(product_name: str):
    """
    Фоновая задача: запускает Scrapy-парсер для одного продукта.
    """
    project_dir = "D:/dev/Show-cook/show_cook/parsers/prices_parser"
    if not os.path.exists(project_dir):
        raise FileNotFoundError(f"Dir not found: {project_dir}")
    os.chdir(project_dir)
    subprocess.run([
        "scrapy", "crawl", "vkusvill", "-a", f"query={product_name}"
    ], check=True)
