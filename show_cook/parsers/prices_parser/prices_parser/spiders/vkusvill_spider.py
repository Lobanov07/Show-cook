import scrapy
from urllib.parse import quote
from prices_parser.items import VkusvillProduct


class VkusvillSpider(scrapy.Spider):
    name = "vkusvill"

    def __init__(self, query=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.query = quote(query)

    def start_requests(self):
        url = f"https://vkusvill.ru/search/?q={self.query}"
        yield scrapy.Request(url, callback=self.parse)

    def parse(self, response):
        products = response.css(".ProductCard")
        for product in products:
            name = product.css(".ProductCard__link::text").get()
            price = product.css(".Price--md::text").re_first(r'\d+,\d+|\d+')
            unit = product.css(".ProductCard__weight::text").get()
            url = response.urljoin(product.css(".ProductCard__link::attr(href)").get())

            if name and price:
                yield VkusvillProduct(
                    name=name.strip(),
                    price=float(price.replace(',', '.')),
                    unit=unit.strip() if unit else '',
                    url=url
                )
            else:
                self.logger.warning(f"Не удалось извлечь данные: name={name}, price={price}, url={url}")

        next_page = response.css('a.next-page::attr(href)').get()
        if next_page:
            yield scrapy.Request(next_page, callback=self.parse)