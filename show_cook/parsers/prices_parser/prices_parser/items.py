# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class PricesParserItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    pass


class VkusvillProduct(scrapy.Item):
    name = scrapy.Field()
    price = scrapy.Field()
    unit = scrapy.Field()
    url = scrapy.Field()
