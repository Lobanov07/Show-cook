from recipes.models import Recipe, Ingredient, RecipeIngredient

def save_recipe_to_db(recipe_data):
    """Добавляет рецепт в базу данных"""
    recipe, created = Recipe.objects.get_or_create(
        title=recipe_data["title"],
        defaults={
            "description": recipe_data["description"],
            "link": recipe_data["link"]
        }
    )

    if created:
        for item in recipe_data["ingredients"]:
            ingredient, _ = Ingredient.objects.get_or_create(name=item["name"])
            RecipeIngredient.objects.create(recipe=recipe, ingredient=ingredient, amount=item["amount"])

    return recipe
