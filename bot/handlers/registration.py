from aiogram import Router, types
from aiogram.fsm.context import FSMContext
from Tudo_bot.states.registration import RegistrationStates
from utils.crypto import encrypt_info
from db.queries.user_queries import add_user, save_user_marks
from services.marks_service import get_all_marks
from Tudo_bot.router import router
import os
from config import user_data
from services.dnevnik_api import login

@router.message(RegistrationStates.waiting_for_username)
async def process_username(message: types.Message, state: FSMContext):
    # Сохраняем введённый логин и переводим пользователя в состояние ожидания пароля
    user_data.setdefault(message.chat.id, {})['username'] = message.text
    await message.answer(f"Логин {message.text} сохранён.\nТеперь введите ваш пароль:")
    await state.set_state(RegistrationStates.waiting_for_password)


@router.message(RegistrationStates.waiting_for_password)
async def process_password(message: types.Message, state: FSMContext):
    # Сохраняем пароль, скрываем его вывод и запускаем авторизацию
    user_data.setdefault(message.chat.id, {})['password'] = message.text
    hidden_password = '*' * len(message.text)
    await message.answer(f"Пароль {hidden_password} сохранён.\nПожалуйста, подождите, идёт авторизация...")
    try:
        main_info = await login(
            message,  # передаем весь объект message
            user_data[message.chat.id]["username"],
            user_data[message.chat.id]["password"],
            action="registr",
            state=state  # не забываем передать state
        )
        if main_info:
            key = os.urandom(32)
            dnevnik_login = encrypt_info(user_data[message.chat.id]["username"], key)
            dnevnik_password = encrypt_info(user_data[message.chat.id]["password"], key)
            dnevnik_id = main_info[0]
            school_name = main_info[1]
            user_class = main_info[2]
            await add_user(
                message.chat.id,
                user_class,
                dnevnik_login,
                dnevnik_password,
                dnevnik_id,
                school_name,
                key,
                message
            )
            marks = await get_all_marks(message.chat.id, school_name, dnevnik_id, include_dates=True)
            print(type(marks))
            save_user_marks(message.chat.id, marks)
            await state.clear()
    except Exception as e:
        # При ошибке авторизации возвращаемся в состояние ожидания логина
        if "Ошибка авторизации" in str(e):
            await message.answer(str(e))
            # Очищаем данные пользователя
            if message.chat.id in user_data:
                user_data[message.chat.id].pop('username', None)
                user_data[message.chat.id].pop('password', None)
            await state.set_state(RegistrationStates.waiting_for_username)
        else:
            await message.answer(str(e))
            await state.clear()