from django.db import models

class Ingredient(models.Model):
    """Модель ингредиента."""
    name = models.CharField(max_length=255, unique=True, verbose_name="Название")

    def __str__(self):
        return self.name


class Recipe(models.Model):
    """Модель рецепта."""
    title = models.CharField(max_length=255, verbose_name="Название рецепта")
    description = models.TextField(verbose_name="Описание")
    ingredients = models.ManyToManyField(Ingredient, through='RecipeIngredient', verbose_name="Ингредиенты")
    link = models.URLField(blank=True, null=True, verbose_name="Ссылка на источник рецепта")

    def __str__(self):
        return self.title


class RecipeIngredient(models.Model):
    """Связь между рецептом и ингредиентами с указанием количества."""
    recipe = models.ForeignKey(
        Recipe, on_delete=models.CASCADE, related_name='recipe_ingredients'
    )
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    amount = models.CharField(max_length=50, verbose_name="Количество")

    def __str__(self):
        return f"{self.ingredient.name} - {self.amount} для {self.recipe.title}"


class ProductPrice(models.Model):
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50, blank=True)
    source = models.CharField(max_length=100)
    url = models.URLField()
    date_parsed = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.price} {self.unit} ({self.source})"
    