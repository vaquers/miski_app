import asyncio
import logging

from aiohttp import web
from aiogram import Bot, Dispatcher
from aiogram.types import BotCommand

from config import TG_TOKEN, API_PORT
from middleware import ThrottledMiddleware
from bot.router import router
from bot.api import create_app

logging.basicConfig(level=logging.INFO)


async def main() -> None:
    bot = Bot(token=TG_TOKEN)
    dp = Dispatcher()
    dp.include_router(router)
    dp.message.middleware(ThrottledMiddleware())

    await bot.set_my_commands([
        BotCommand(command="start", description="🚀 Запустить бота"),
    ])

    app = create_app()
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", API_PORT)
    await site.start()
    logging.info("API сервер запущен на порту %s", API_PORT)

    try:
        logging.info("Бот запущен!")
        await dp.start_polling(bot)
    finally:
        await runner.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
