from aiogram import types
from aiogram.fsm.context import FSMContext
from datetime import datetime
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

from config import get_webapp_url


async def regime_dnevnik(message: types.Message, state: FSMContext = None):
    """Меню режима дневника: расписание, ДЗ, оценки."""
    buttons = [
        [types.InlineKeyboardButton(text="📅 Расписание", callback_data="current_day_schedule")],
        [types.InlineKeyboardButton(text="📝 Домашнее задание", callback_data="tomorrow_homework")],
        [types.InlineKeyboardButton(text="📊 Оценки", callback_data="recent_marks")],
    ]
    markup = types.InlineKeyboardMarkup(inline_keyboard=buttons)
    await message.answer("📖 Дневник:", reply_markup=markup)


def done_button() -> InlineKeyboardMarkup:
    """Кнопка «Готово» для закрытия меню."""
    return types.InlineKeyboardMarkup(inline_keyboard=[
        [types.InlineKeyboardButton(text="✅ Готово", callback_data="close_menu")]
    ])


async def main_menu():
    buttons = [
        [
            types.KeyboardButton(
                text="📖 дневник",
                web_app=WebAppInfo(url=get_webapp_url()),
            )
        ],
        [types.KeyboardButton(text="🧠 TudoAI")]
    ]

    markup = types.ReplyKeyboardMarkup(
        keyboard=buttons,
        resize_keyboard=True,
    )
    return markup

def get_subjects_keyboard():
    buttons = [
        [
            InlineKeyboardButton(text="🇷🇺 Русский язык", callback_data="exam_russian"),
            InlineKeyboardButton(text="📐 Математика", callback_data="exam_math")
        ],
        [
            InlineKeyboardButton(text="🇧🇾 Белорусский язык", callback_data="exam_belarusian"),
            InlineKeyboardButton(text="🏰 История", callback_data="exam_history")
        ],
        [
            InlineKeyboardButton(text="✅ Все предметы", callback_data="exam_all")
        ]
    ]
    markup = types.InlineKeyboardMarkup(inline_keyboard=buttons, one_time_keyboard=True)
    return markup
