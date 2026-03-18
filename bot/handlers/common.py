from aiogram import Router, types
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from db.queries.user_queries import fetch_all_users_id
from db.queries.subscription_queries import (
    get_payment_by_telegram_charge_id,
    get_payments_by_user,
    mark_payment_refunded,
    add_free_access,
    remove_free_access,
    list_free_access,
)
from config import ADMIN_ID, WEBAPP_URL
from Tudo_bot.router import router
from Tudo_bot.states.info import SendMessageStates, BroadcastStates


@router.message(Command('start'))
async def start(message: types.Message, state: FSMContext):
    """
    Стартовая команда: всегда показывает текст
    «Привет! Открывай приложение, нажав кнопку снизу»
    и кнопку web_app для открытия Mini App.
    """
    await state.clear()

    await message.answer(
        "Привет! Открывай приложение, нажав кнопку снизу"
    )


# Команда для отправки сообщения (только для админа)
@router.message(Command('send_message'))
async def send_message_start(message: types.Message, state: FSMContext):
    if message.from_user.id == ADMIN_ID:
        await message.answer("Введите Telegram ID пользователя:")
        await state.set_state(SendMessageStates.waiting_for_user_id_for_send_message)
    else:
        await message.answer("Сорян, только для админа")


@router.message(Command('users'))
async def send_all_users_to_admin(message: types.Message, state: FSMContext):
    if message.from_user.id != ADMIN_ID:
        return

    users = fetch_all_users_id()  # список кортежей [(id,), (id,), ...]
    total = len(users)
    available = 0
    unavailable = 0

    text_lines = ["Список пользователей:"]

    for user in users:
        user_id = user[0]
        try:
            chat = await message.bot.get_chat(user_id)
            username = f"@{chat.username}" if chat.username else "нет username"
            text_lines.append(f"{user_id} — {username}")
            available += 1
        except Exception:
            text_lines.append(f"{user_id} — недоступен")
            unavailable += 1

    text_lines.append(f"\nВсего пользователей: {total}")
    text_lines.append(f"Доступно: {available}")
    text_lines.append(f"Недоступно: {unavailable}")

    text = "\n".join(text_lines)

    await message.answer(text)


# Рассылка сообщения всем пользователям (только для админа). Поддерживается текст, фото и видео.
@router.message(Command('broadcast'))
async def broadcast_start(message: types.Message, state: FSMContext):
    if message.from_user.id != ADMIN_ID:
        await message.answer("Эта команда только для администратора.")
        return
    await state.clear()
    await message.answer(
        "📢 Режим рассылки.\n\n"
        "Отправьте одно сообщение:\n"
        "• только текст — разошлётся как текст;\n"
        "• фото с подписью или без — разошлётся как фото;\n"
        "• видео с подписью или без — разошлётся как видео.\n\n"
        "Для отмены отправьте /cancel"
    )
    await state.set_state(BroadcastStates.waiting_for_content)


# Платежи и возврат Stars (только для админа)
@router.message(Command('payments'))
async def cmd_payments(message: types.Message):
    """Список платежей пользователя: /payments <telegram_id> — чтобы скопировать charge_id для возврата."""
    if message.from_user.id != ADMIN_ID:
        return
    text = (message.text or "").strip().split(maxsplit=1)
    if len(text) < 2:
        await message.answer(
            "Использование: /payments <telegram_id>\n"
            "Покажет платежи пользователя. Скопируй telegram_payment_charge_id для /refund."
        )
        return
    try:
        user_id = int(text[1])
    except ValueError:
        await message.answer("Укажи числовой Telegram ID.")
        return
    rows = get_payments_by_user(user_id)
    if not rows:
        await message.answer(f"Платежей у пользователя {user_id} нет.")
        return
    lines = [f"Платежи user_id={user_id}:"]
    for row in rows:
        pid, uid, amount, charge_id, created_at, refunded_at = row
        created = str(created_at)[:19] if created_at else "—"
        status = "❌ возврат" if refunded_at else "✅"
        lines.append(f"{status} {amount} ⭐ | {created}")
        lines.append(f"   charge_id: `{charge_id}`")
    await message.answer("\n".join(lines), parse_mode="Markdown")


@router.message(Command('refund'))
async def cmd_refund(message: types.Message):
    """Вернуть звёзды: /refund <telegram_payment_charge_id> (только админ)."""
    if message.from_user.id != ADMIN_ID:
        await message.answer("Только для администратора.")
        return
    text = (message.text or "").strip().split(maxsplit=1)
    if len(text) < 2:
        await message.answer(
            "Использование: /refund <telegram_payment_charge_id>\n"
            "charge_id смотри в /payments <user_id>."
        )
        return
    charge_id = text[1].strip()
    row = get_payment_by_telegram_charge_id(charge_id)
    if not row:
        await message.answer("Платёж с таким charge_id не найден.")
        return
    _id, user_id, amount_stars, _cid, refunded_at = row
    if refunded_at:
        await message.answer("Этот платёж уже был возвращён.")
        return
    try:
        await message.bot.refund_star_payment(user_id=user_id, telegram_payment_charge_id=charge_id)
        mark_payment_refunded(charge_id)
        await message.answer(f"✅ Возврат {amount_stars} ⭐ пользователю {user_id} выполнен.")
    except Exception as e:
        await message.answer(f"Ошибка возврата: {e}")


# Бесплатный доступ (только для админа): месяц или навсегда
@router.message(Command('free_add'))
async def cmd_free_add(message: types.Message):
    """Выдать бесплатный доступ: /free_add <user_id> <monthly|forever>"""
    if message.from_user.id != ADMIN_ID:
        await message.answer("Только для администратора.")
        return
    parts = (message.text or "").strip().split(maxsplit=2)
    if len(parts) < 3:
        await message.answer(
            "Использование: /free_add <user_id> <monthly|forever>\n"
            "monthly — бесплатно на 31 день, forever — навсегда."
        )
        return
    try:
        user_id = int(parts[1])
    except ValueError:
        await message.answer("Укажи числовой Telegram ID.")
        return
    access_type = parts[2].strip().lower()
    if access_type not in ("monthly", "forever"):
        await message.answer("Тип доступа: monthly или forever.")
        return
    add_free_access(user_id, access_type, granted_by=message.from_user.id)
    label = "на 31 день" if access_type == "monthly" else "навсегда"
    await message.answer(f"✅ Пользователю {user_id} выдан бесплатный доступ {label}.")


@router.message(Command('free_remove'))
async def cmd_free_remove(message: types.Message):
    """Снять бесплатный доступ: /free_remove <user_id>"""
    if message.from_user.id != ADMIN_ID:
        await message.answer("Только для администратора.")
        return
    parts = (message.text or "").strip().split(maxsplit=1)
    if len(parts) < 2:
        await message.answer("Использование: /free_remove <user_id>")
        return
    try:
        user_id = int(parts[1])
    except ValueError:
        await message.answer("Укажи числовой Telegram ID.")
        return
    remove_free_access(user_id)
    await message.answer(f"✅ Бесплатный доступ у пользователя {user_id} снят.")


@router.message(Command('free_list'))
async def cmd_free_list(message: types.Message):
    """Список пользователей с бесплатным доступом (только админ)."""
    if message.from_user.id != ADMIN_ID:
        return
    rows = list_free_access()
    if not rows:
        await message.answer("Нет пользователей с бесплатным доступом.")
        return
    lines = ["Пользователи с бесплатным доступом:"]
    for row in rows:
        uid, access_type, granted_at, granted_by = row
        granted = str(granted_at)[:10] if granted_at else "—"
        typ = "31 день" if access_type == "monthly" else "навсегда"
        lines.append(f"• {uid} — {typ}, с {granted}")
    await message.answer("\n".join(lines))