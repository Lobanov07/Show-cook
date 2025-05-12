from asgiref.sync import sync_to_async
from decimal import Decimal
from recipes.models import ProductPrice


class DjangoWriterPipeline:
    async def process_item(self, item, spider):
        print(f"Обработка товара: {item['name']}, цена: {item['price']}")
        try:
            price = Decimal(str(item['price']))
            await sync_to_async(ProductPrice.objects.create)(
                name=item['name'],
                price=price,
                unit=item['unit'],
                source="vkusvill",
                url=item['url']
            )
            print(f"Товар {item['name']} успешно записан в базу данных")
        except Exception as e:
            print(f"Ошибка при записи товара {item['name']}: {str(e)}")
        return item
