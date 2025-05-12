import os
import sys
import django



sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../../'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'show_cook.settings')
django.setup()

BOT_NAME = "prices_parser"


SPIDER_MODULES = ["prices_parser.spiders"]
NEWSPIDER_MODULE = "prices_parser.spiders"
DOWNLOAD_DELAY = 1

USER_AGENT = "Mozilla/5.0"

ROBOTSTXT_OBEY = False

ITEM_PIPELINES = {
    'parsers.prices_parser.prices_parser.pipelines.DjangoWriterPipeline': 300,
}
DOWNLOADER_MIDDLEWARES = {
    'prices_parser.middlewares.SeleniumMiddleware': 543,
}

TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"
FEED_EXPORT_ENCODING = "utf-8"
