from aiogram import types


# Асинхронная функция для запроса выбора четверти
async def request_quarter_id(message: types.Message):
    buttons = [
        [types.InlineKeyboardButton(text="1", callback_data="84"),
        types.InlineKeyboardButton(text="2", callback_data="85"),
        types.InlineKeyboardButton(text="3", callback_data="86"),
        types.InlineKeyboardButton(text="4", callback_data="87")]
    ]

    markup = types.InlineKeyboardMarkup(inline_keyboard=buttons)
    await message.answer("Выберите четверть:", reply_markup=markup)

