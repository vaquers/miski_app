from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext
from aiogram.dispatcher.middlewares.base import BaseMiddleware
from typing import Callable, Dict, Any
from Tudo_bot.states.registration import RegistrationStates  
from db.queries.user_queries import fetch_all_users_id
import time


class RegistretionMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[Any, Dict[str, Any]], Any],
        event: Message | CallbackQuery,
        data: Dict[str, Any]
    ) -> Any:
        
        # Получаем состояние FSM
        state: FSMContext = data.get("state")
        current_state = await state.get_state() if state else None

        # Пропускаем, если пользователь в состоянии регистрации
        if current_state in [
            RegistrationStates.waiting_for_username.state,
            RegistrationStates.waiting_for_password.state
        ]:
            return await handler(event, data)

        # Работа с Message
        if isinstance(event, Message):
            if event.text not in ["/start", "/info"] and not await is_user_registered(event.chat.id):
                await event.answer("Сначала зарегистрируйтесь в боте, для этого введите команду /start")
                return

        # Работа с CallbackQuery
        elif isinstance(event, CallbackQuery):
            if not await is_user_registered(event.from_user.id):
                await event.answer("Сначала зарегистрируйтесь через /start", show_alert=True)
                return

        return await handler(event, data)


class ThrottledMiddleware(BaseMiddleware):
    def __init__(self, limit_seconds: float = 1.0):
        self.limit = limit_seconds
        self.timestamps = {}

    async def __call__(
        self,
        handler: Callable[[Any, Dict[str, Any]], Any],
        event: Message | CallbackQuery,
        data: Dict[str, Any]
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
            # можно отправить предупреждение или просто замолчать
            if isinstance(event, Message):
                await event.answer("Слишком часто. Подожди немного.")
            return

        self.timestamps[user_id] = now
        return await handler(event, data)



async def is_user_registered(user_id):
    all_users = fetch_all_users_id()
    
    if all_users is None:
        all_users = []
        
    user_ids = [user[0] for user in all_users]
    
    if user_id in user_ids:
        return True
    return False