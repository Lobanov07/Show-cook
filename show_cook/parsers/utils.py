import requests
from bs4 import BeautifulSoup


def parse_povarenok_recipe(url):
    """Функция парсинга одного рецепта с povarenok.ru"""
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return None

    soup = BeautifulSoup(response.text, "html.parser")

    title = soup.find("h1").text.strip()

    description_tag = soup.find("div", class_="article-text")
    description = description_tag.text.strip() if description_tag else ""

    ingredients = []
    for item in soup.find_all("li", itemprop="recipeIngredient"):
        name = item.find("a").find("span").text.strip()
        amount = item.find_all("span")[-1].text.strip()

        ingredients.append({"name": name, "amount": amount})

    return {
        "title": title,
        "description": description,
        "ingredients": ingredients,
        "link": url
    }
