
from sqlitedict import SqliteDict
from datetime import date
from cache import get_cache


TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS"
cache = get_cache()

def abuse_detected(ip):
    today = date.today().strftime("%d/%m/%Y")
    key = f'ip:{ip}-{today}'
    if key in cache:
        count = cache[key]
        if count > 1000:
            return True
        cache[key] = count + 1
    else:
        cache[key] = 0
    return False
