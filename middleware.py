from aiogram.types import Message, CallbackQuery
from aiogram.dispatcher.middlewares.base import BaseMiddleware
from typing import Callable, Dict, Any
import time


class ThrottledMiddleware(BaseMiddleware):
    def __init__(self, limit_seconds: float = 1.0):
        self.limit = limit_seconds
        self.timestamps: dict[int, float] = {}

    async def __call__(
        self,
        handler: Callable[[Any, Dict[str, Any]], Any],
        event: Message | CallbackQuery,
        data: Dict[str, Any],
    ) -> Any:
        user_id = (
            event.from_user.id
            if isinstance(event, (Message, CallbackQuery))
            else None
        )
        if user_id is None:
            return await handler(event, data)

        now = time.monotonic()
        last_time = self.timestamps.get(user_id, 0)

        if now - last_time < self.limit:
            if isinstance(event, Message):
                await event.answer("Слишком часто. Подожди немного.")
            return

        self.timestamps[user_id] = now
        return await handler(event, data)
