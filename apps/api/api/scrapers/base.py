import asyncio
import functools
import logging
from datetime import datetime

logger = logging.getLogger("dira-fair.scrapers")


def rate_limit(seconds: float = 1.0):
    """Decorator to rate-limit function calls."""

    def decorator(func):
        last_called = {"time": 0.0}

        @functools.wraps(func)
        async def wrapper(*args, **kwargs):
            elapsed = asyncio.get_event_loop().time() - last_called["time"]
            if elapsed < seconds:
                await asyncio.sleep(seconds - elapsed)
            last_called["time"] = asyncio.get_event_loop().time()
            return await func(*args, **kwargs)

        return wrapper

    return decorator


def log_scrape(source: str, count: int):
    logger.info(f"[{source}] Scraped {count} records at {datetime.utcnow().isoformat()}")
