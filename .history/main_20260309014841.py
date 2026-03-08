import asyncio
from aiogram import Bot, Dispatcher
from aiogram.filters import Command
from aiogram.types import BotCommand, Chat
from Tudo_bot.router import router
from config import bot
from aiogram.types import FSInputFile
from pathlib import Path

import config





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
