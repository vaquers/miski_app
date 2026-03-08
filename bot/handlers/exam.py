from db.queries.user_queries import fetch_all_users_id
from Tudo_bot.keyboards.main_menu import main_menu
from Tudo_bot.states.registration import RegistrationStates
from Tudo_bot.router import router
from aiogram import types
from aiogram.fsm.context import FSMContext
from aiogram.filters import Command
import os
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.fsm.storage.memory import MemoryStorage
from config import SUBJECT_FILES
from Tudo_bot.keyboards.main_menu import get_subjects_keyboard
from db.queries.file_queries import save_sent_file, get_sent_file, get_all_sent_files
from db.queries.user_queries import get_class
@router.message(Command('exam'))
async def show_sborniki(message: types.Message, state: FSMContext):
    user_id = message.chat.id
    all_users = fetch_all_users_id()
    user_ids = [user[0] for user in all_users]
    user_class = get_class(user_id)
    if user_id in user_ids and user_class == 9:
        await message.answer(
            "Выберите предмет:",
            reply_markup=get_subjects_keyboard()
        )
    else:
        await message.answer("Эта команда доступна только для учеников 9 класса.")

@router.callback_query(lambda c: c.data.startswith('exam_'))
async def process_subject_selection(callback_query: types.CallbackQuery):
    user_id = callback_query.from_user.id
    subject = callback_query.data.replace('exam_', '')
    await callback_query.message.delete()
    
    if subject == 'all':
        # Отправляем все файлы
        for subject_name, file_path in SUBJECT_FILES.items():
            if os.path.exists(file_path):
                if subject_name == 'history':
                    caption = "🏰 История(кратко)"
                elif subject_name == 'math':
                    caption = "📐 Математика"
                elif subject_name == 'belarusian':
                    caption = "🇧🇾 Белорусския язык"
                elif subject_name == 'russian':
                    caption = "🇷🇺 Русский язык"
                else:
                    caption = f"📘 Сборник по {subject_name.replace('_', ' ').title()}"
                
                # Проверяем, есть ли уже отправленный файл в базе данных
                sent_file = get_sent_file(user_id, subject_name)
                
                if sent_file:
                    message_id, file_caption = sent_file
                    try:
                        # Пытаемся ответить на сообщение с файлом
                        await callback_query.message.answer(
                            f"Файл уже был отправлен ранее. Вот ссылка на него:",
                            reply_to_message_id=message_id
                        )
                    except Exception:
                        # Если не удалось ответить на сообщение, отправляем файл заново
                        msg = await callback_query.message.answer_document(
                            types.FSInputFile(file_path),
                            caption=caption
                        )
                        # Обновляем информацию в базе данных
                        save_sent_file(user_id, subject_name, msg.message_id, caption)
                else:
                    # Отправляем файл впервые
                    msg = await callback_query.message.answer_document(
                        types.FSInputFile(file_path),
                        caption=caption
                    )
                    # Сохраняем информацию в базу данных
                    save_sent_file(user_id, subject_name, msg.message_id, caption)
    else:
        # Отправляем один файл
        file_path = SUBJECT_FILES.get(subject)
        if file_path and os.path.exists(file_path):
            if subject == 'history':
                caption = "🏰 История(кратко)"
            elif subject == 'math':
                caption = "📐 Математика"
            elif subject == 'belarusian':
                caption = "🇧🇾 Белорусския язык"
            elif subject == 'russian':
                caption = "🇷🇺 Русский язык"
            else:
                caption = f"📘 Сборник по {subject.replace('_', ' ').title()}"
            
            # Проверяем, есть ли уже отправленный файл в базе данных
            sent_file = get_sent_file(user_id, subject)
            
            if sent_file:
                message_id, file_caption = sent_file
                try:
                    # Пытаемся ответить на сообщение с файлом
                    await callback_query.message.answer(
                        f"Файл уже был отправлен ранее. Вот ссылка на него:",
                        reply_to_message_id=message_id
                    )
                except Exception:
                    # Если не удалось ответить на сообщение, отправляем файл заново
                    msg = await callback_query.message.answer_document(
                        types.FSInputFile(file_path),
                        caption=caption
                    )
                    # Обновляем информацию в базе данных
                    save_sent_file(user_id, subject, msg.message_id, caption)
            else:
                # Отправляем файл впервые
                msg = await callback_query.message.answer_document(
                    types.FSInputFile(file_path),
                    caption=caption
                )
                # Сохраняем информацию в базу данных
                save_sent_file(user_id, subject, msg.message_id, caption)
        else:
            await callback_query.message.answer("Файл не найден. Обратись к администратору.")

    await callback_query.answer()