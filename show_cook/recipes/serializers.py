from rest_framework import serializers
from .models import Recipe, RecipeIngredient, Ingredient


class IngredientSerializer(serializers.ModelSerializer):
    """Сериализатор для ингредиента"""
    class Meta:
        model = Ingredient
        fields = ['name']


class RecipeIngredientSerializer(serializers.ModelSerializer):
    """Сериализатор для связи рецепт-ингредиент (с указанием количества)"""
    ingredient = serializers.CharField()

    class Meta:
        model = RecipeIngredient
        fields = ['ingredient', 'amount']


class RecipeSerializer(serializers.ModelSerializer):
    """Сериализатор для работы с рецептами"""
    ingredients = RecipeIngredientSerializer(many=True)

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'description', 'ingredients', 'link']

    def create(self, validated_data):
        """Создание рецепта с ингредиентами"""
        ingredients_data = validated_data.pop('ingredients')
        recipe = Recipe.objects.create(**validated_data)

        for ingredient_data in ingredients_data:
            ingredient_name = ingredient_data['ingredient']
            ingredient, created = Ingredient.objects.get_or_create(
                name=ingredient_name)

            RecipeIngredient.objects.create(
                recipe=recipe,
                ingredient=ingredient,
                amount=ingredient_data['amount'])

        return recipe

    def update(self, instance, validated_data):
        """Обновление рецепта"""
        ingredients_data = validated_data.pop('ingredients', None)
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get(
            'description',
            instance.description)
        instance.link = validated_data.get('link', instance.link)
        instance.save()

        if ingredients_data:
            instance.recipeingredient_set.all().delete()
            for ingredient_data in ingredients_data:
                ingredient_name = ingredient_data['ingredient']
                ingredient, created = Ingredient.objects.get_or_create(
                    name=ingredient_name)
                RecipeIngredient.objects.create(
                    recipe=instance,
                    ingredient=ingredient,
                    amount=ingredient_data['amount'])

        return instance
