from aiogram import Router, F
from aiogram.types import (
    Message,
    ReplyKeyboardMarkup,
    KeyboardButton,
    WebAppInfo,
)
from aiogram.filters import Command

from config import ADMIN_ID, WEBAPP_URL, MISSES, APP_VERSION
from bot.visibility import load_visibility, toggle_visibility

router = Router()


def _webapp_url() -> str:
    """Return WEBAPP_URL with a cache-busting version parameter."""
    sep = "&" if "?" in WEBAPP_URL else "?"
    return f"{WEBAPP_URL}{sep}v={APP_VERSION}"


def build_admin_keyboard() -> ReplyKeyboardMarkup:
    visibility = load_visibility()
    buttons = []
    for miss in MISSES:
        is_visible = visibility.get(miss["id"], True)
        emoji = "🟢" if is_visible else "🔴"
        buttons.append([KeyboardButton(text=f"{emoji} {miss['name']}")])
    return ReplyKeyboardMarkup(keyboard=buttons, resize_keyboard=True)


def get_miss_id_by_name(name: str) -> str | None:
    for miss in MISSES:
        if miss["name"] == name:
            return miss["id"]
    return None


@router.message(Command("start"))
async def cmd_start(message: Message) -> None:
    if message.from_user.id == ADMIN_ID:
        await message.answer(
            "👑 Панель управления Мисс Лицей",
            reply_markup=build_admin_keyboard(),
        )
    else:
        keyboard = ReplyKeyboardMarkup(
            keyboard=[
                [
                    KeyboardButton(
                        text="🌟 Открыть Мисс Лицей",
                        web_app=WebAppInfo(url=_webapp_url()),
                    )
                ]
            ],
            resize_keyboard=True,
        )
        await message.answer(
            "Откройте мини приложение по кнопке снизу",
            reply_markup=keyboard,
        )


@router.message(F.text.startswith("🟢") | F.text.startswith("🔴"))
async def handle_toggle(message: Message) -> None:
    if message.from_user.id != ADMIN_ID:
        return

    name = message.text[2:].strip()
    miss_id = get_miss_id_by_name(name)

    if miss_id is None:
        await message.answer("Участница не найдена")
        return

    new_state = toggle_visibility(miss_id)
    status = "показывается" if new_state else "скрыта"
    emoji = "🟢" if new_state else "🔴"

    await message.answer(
        f"{emoji} {name} — {status}",
        reply_markup=build_admin_keyboard(),
    )
