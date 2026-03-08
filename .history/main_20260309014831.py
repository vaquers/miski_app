import asyncio
from aiogram import Bot, Dispatcher
from aiogram.filters import Command
from aiogram.types import BotCommand, Chat
from Tudo_bot.router import router
from config import bot
from aiogram.types import FSInputFile
from pathlib import Path

import config


tracemalloc.start()


async def log_memory_growth():
    while True:
        await asyncio.sleep(60)
        snapshot = tracemalloc.take_snapshot()
        top_stats = snapshot.statistics('lineno')
        

async def cleanup_tasks():
    while True:
        await asyncio.sleep(300)  # Каждые 5 минут
        await cleanup_unused_sessions()
        await cleanup_cache()

class ResourceManager:
    def __init__(self):
        self.semaphore = asyncio.Semaphore(10)  # Ограничение одновременных запросов
        
    async def acquire(self):
        await self.semaphore.acquire()
        
    def release(self):
        self.semaphore.release()

async def get_usernames(user_ids: list[int]) -> dict[int, str | None]:
    result = {}
    for user_id in user_ids:
        try:
            chat: Chat = await bot.get_chat(user_id)
            result[user_id] = chat.username  # Может быть None, если у пользователя нет username
        except Exception as e:
            result[user_id] = None  # Например, если пользователь заблокировал бота
    return result

# Главная функция запуска бота
async def main():
    # Инициализация бота с токеном
    dp = Dispatcher()
    usernames = await get_usernames(user_ids)
    # with open("usernames.txt", "w", encoding="utf-8") as f:
    #     for uid, username in usernames.items():
    #         line = f"{uid}: @{username}\n" if username else f"{uid}: [no username or no access]\n"
    #         f.write(line)
    dp.include_router(router)
    dp.message.middleware(utils.is_user_reg.RegistretionMiddleware())
    dp.message.middleware(utils.is_user_reg.ThrottledMiddleware())
    # Инициализация менеджера ресурсов
    await init_resource_manager()
    
    try:
        # Регистрация команд в меню бота
        await bot.set_my_commands([
            BotCommand(command="start", description="🚀 Запустить бота"),
        ])

        asyncio.create_task(log_memory_growth())
        asyncio.create_task(cleanup_tasks())  # Заменяем отдельные задачи очистки на одну общую
        # Запуск FastAPI-бэкенда (API для Mini App) на порту 8000
        backend_config = uvicorn.Config(app, host="0.0.0.0", port=8000)
        backend_server = uvicorn.Server(backend_config)
        asyncio.create_task(backend_server.serve())
        print("Бот запущен!")
        print("Бэкенд (API) доступен на http://0.0.0.0:8000")
        print(html_cache)
        await dp.start_polling(bot)
    finally:
        # Очистка ресурсов при завершении
        await cleanup_resource_manager()

# Запуск программы
if __name__ == '__main__':
    asyncio.run(main())
