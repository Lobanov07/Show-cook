import scrapy
from urllib.parse import quote
from prices_parser.items import VkusvillProduct


class VkusvillSpider(scrapy.Spider):
    name = "vkusvill"

    def __init__(self, query=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.query = query
        self.encoded_query = quote(query)
        self.collected_products = []

    def start_requests(self):
        url = f"https://vkusvill.ru/search/?q={self.encoded_query}&sort=RELEVANT&type=products"
        yield scrapy.Request(url, callback=self.parse)

    def parse(self, response):
        products = response.css(".ProductCard")

        for product in products:
            if len(self.collected_products) >= 20:
                break

            name = product.css(".ProductCard__link::text").get()
            price = product.css(".Price--md::text").re_first(r'\d+,\d+|\d+')
            unit = product.css(".ProductCard__weight::text").get()
            #url = f"https://vkusvill.ru/search/?q={self.encoded_query}&sort=PRICE_ASC&type=products"
            url = f"https://vkusvill.ru/search/?q={self.encoded_query}&sort=RELEVANT&type=products"
            #url = f"https://vkusvill.ru/search/?q={self.encoded_query}"

            if name and price: #and name.split()[0].lower() == self.query.lower():
                self.collected_products.append({
                    "name": name.strip(),
                    "price": float(price.replace(',', '.')),
                    "unit": unit.strip() if unit else '',
                    "url": url
                })

        
        if len(self.collected_products) >= 1:
            avg_price = sum(p["price"] for p in self.collected_products) / len(self.collected_products)
            avg_unit = 0
            
            for p in self.collected_products:
                
                if  len(p["unit"]) > 0:
                    if float(p["unit"].split()[0]) == 1:
                        avg_unit += 1000
                elif p["unit"]:
                    avg_unit += int(p["unit"].split()[0])
                else:
                    avg_unit += 1000
            avg_unit = avg_unit / len(self.collected_products)

            yield VkusvillProduct(
                name=self.query.strip().capitalize(),
                price=round(avg_price, 2),
                #unit=self.collected_products[0]["unit"],
                unit=round(avg_unit, 2),
                url=self.collected_products[0]["url"]
            )
