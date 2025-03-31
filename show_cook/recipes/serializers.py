from rest_framework import serializers
from .models import Recipe, RecipeIngredient, Ingredient


class IngredientSerializer(serializers.ModelSerializer):
    """Сериализатор ингредиента"""
    class Meta:
        model = Ingredient
        fields = ['name']


class RecipeIngredientSerializer(serializers.ModelSerializer):
    """Сериализатор связи рецепт-ингредиент"""
    ingredient = serializers.CharField()

    class Meta:
        model = RecipeIngredient
        fields = ['ingredient', 'amount']

    def validate_ingredient(self, value):
        """Создаём ингредиент, если его нет"""
        ingredient, created = Ingredient.objects.get_or_create(name=value)
        return ingredient


class RecipeSerializer(serializers.ModelSerializer):
    """Сериализатор рецепта"""
    ingredients = RecipeIngredientSerializer(many=True, source='recipe_ingredients')

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'description', 'ingredients', 'link']

    def create(self, validated_data):
        """Создание рецепта с ингредиентами"""
        ingredients_data = validated_data.pop('recipe_ingredients')
        recipe = Recipe.objects.create(**validated_data)

        for ingredient_data in ingredients_data:
            ingredient, created = Ingredient.objects.get_or_create(name=ingredient_data['ingredient'])
            RecipeIngredient.objects.create(
                recipe=recipe,
                ingredient=ingredient,
                amount=ingredient_data['amount']
            )

        return recipe

    def update(self, instance, validated_data):
        """Обновление рецепта"""
        ingredients_data = validated_data.pop('recipe_ingredients', None)
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.link = validated_data.get('link', instance.link)
        instance.save()

        if ingredients_data:
            instance.recipe_ingredients.all().delete()
            for ingredient_data in ingredients_data:
                ingredient, created = Ingredient.objects.get_or_create(name=ingredient_data['ingredient'])
                RecipeIngredient.objects.create(
                    recipe=instance,
                    ingredient=ingredient,
                    amount=ingredient_data['amount']
                )

        return instance
