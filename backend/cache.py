
import os
from sqlitedict import SqliteDict


def get_cache():
    path = os.path.join(os.path.dirname(__file__), 'cached', 'cache.sqlite')
    cache = SqliteDict(path, autocommit=True)
    return cache
