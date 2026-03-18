from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from datetime import datetime, timedelta
from services.homework_service import get_homework_for_day, get_homework_for_all_days
from utils.date_helpers import get_base_date_for_calculations
from Tudo_bot.keyboards.homework import regime_homework
from Tudo_bot.keyboards.main_menu import regime_dnevnik
from Tudo_bot.router import router
from db.queries.user_queries import fetch_user_info_by_id
from services.dnevnik_api import login, find_day_in_quarter
from config import user_data, SUBJECT_EMOJIS
import time
from db.queries.homework_file_queries import save_homework_file, get_homework_file
from utils.markdown_formatter import escape_markdown as escape_md
from aiogram.enums import ParseMode
from aiogram.exceptions import TelegramBadRequest

@router.callback_query(F.data.in_(["tomorrow_homework", "whole_homeworkk", "choose_day_homework", "back_homework"]))
async def handle_homework_button_click(callback: types.CallbackQuery, state: FSMContext):
    telegram_user_id = callback.message.chat.id

    if callback.data == "tomorrow_homework":
        await callback.message.edit_text("выбранный диапазон: дз на завтра")
        tomorrow = datetime.now() + timedelta(days=1)

        if tomorrow.weekday() in [5, 6]:
            next_monday = tomorrow + timedelta(days=(7 - tomorrow.weekday()))
            date_str = next_monday.strftime('%d.%m.%Y')
            await callback.message.answer(f"Завтра выходной. Вот домашнее задание на понедельник ({date_str}):")
        else:
            date_str = tomorrow.strftime('%d.%m.%Y')

        await get_homework_for_day(date_str, callback.message, state=state)
        await callback.answer()

    elif callback.data == "whole_homeworkk":
        await callback.message.edit_text("выбранный диапазон: все дз")
        await handle_whole_homework(callback)
        await callback.answer()

    elif callback.data == "choose_day_homework":
        try:
            await callback.message.edit_text("Выберите день для дз, используя кнопку")
            days_of_week = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"]
            buttons = [[types.InlineKeyboardButton(text=day, callback_data=f"day_for_homework_{day}")] for day in days_of_week]
            markup = types.InlineKeyboardMarkup(inline_keyboard=buttons)
            await callback.message.answer("Выберите день недели", reply_markup=markup)
        except Exception as e:
            print(f"ERROR: {e}")
            await callback.answer("❌ Произошла ошибка.", show_alert=True)

    elif callback.data == "back_homework":
        await callback.message.delete()
        await regime_dnevnik(callback.message, state=state)
        await callback.answer()

    
@router.callback_query(F.data.startswith("day_for_homework_"))
async def handle_homework_day_of_week_selection(callback: types.CallbackQuery, state: FSMContext):
    telegram_user_id = callback.message.chat.id
    print(f"DEBUG: Получены данные callback.data = {callback.data}")

    try:
        data_parts = callback.data.split('_')
        if len(data_parts) < 4:
            await callback.answer("❌ Неверный формат данных для обработки дня.", show_alert=True)
            return

        day_of_week = '_'.join(data_parts[3:])
        print(f"DEBUG: Выбранный день недели: {day_of_week}")

        days_of_week = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"]
        if day_of_week not in days_of_week:
            await callback.answer("❌ Неверный день недели.", show_alert=True)
            return

        await callback.message.edit_text(f"Выбранный день: {day_of_week}")

        base_date = get_base_date_for_calculations(telegram_user_id, use_quarter_date=True)
        day_index = days_of_week.index(day_of_week)
        current_day_index = base_date.weekday()
        days_diff = (day_index - current_day_index) % 7
        if days_diff > 0 and current_day_index <= 4:
            days_diff = days_diff - 7
            
        selected_date = base_date + timedelta(days=days_diff)
        date_str = selected_date.strftime('%d.%m.%Y')
        print(f"DEBUG: Домашнее задание на дату: {date_str}")

        await get_homework_for_day(date_str, callback.message, state=state)
        
        await callback.answer()
    except Exception as e:
        print(f"ERROR: {str(e)}")
        await callback.answer("❌ Произошла ошибка при обработке.", show_alert=True)



@router.callback_query(F.data.startswith("homework_week_") | F.data.eq("back_to_regime_homework"))
async def handle_homework_interaction(callback: types.CallbackQuery, state: FSMContext):
    try:
        telegram_user_id = callback.message.chat.id

        if callback.data.startswith("homework_week_"):
            data_parts = callback.data.split("_")
            if len(data_parts) != 3:
                await callback.answer("❌ Неверный формат callback_data.", show_alert=True)
                return

            week_choice = data_parts[2]
            if week_choice == "past":
                week_str = "прошлая"
            elif week_choice == "current":
                week_str = "текущая"
            elif week_choice == "next":
                week_str = "следующая"
            else:
                await callback.answer("❌ Неверный выбор недели.", show_alert=True)
                return

            print(f"DEBUG: Пользователь выбрал {week_str} неделю.")
            await callback.message.edit_text(f"выбранная неделя: {week_str}")
            await get_homework_for_all_days(week_str, callback.message, state=state)

        elif callback.data == "back_to_regime_homework":
            markup = regime_homework()
            await callback.message.edit_text("выберите диапазон:", reply_markup=markup)

        await callback.answer()
    except Exception as e:
        print(f"ERROR: {str(e)}")
        await callback.answer("❌ Произошла ошибка при обработке.", show_alert=True)

# Асинхронная функция для обработки выбора домашнего задания
async def handle_whole_homework(callback: types.CallbackQuery):
    telegram_user_id = callback.message.chat.id

    buttons = [
        [types.InlineKeyboardButton(text="прошлая", callback_data="homework_week_past")],
        [types.InlineKeyboardButton(text="текущая", callback_data="homework_week_current")],
        [types.InlineKeyboardButton(text="следующая", callback_data="homework_week_next")],
        [types.InlineKeyboardButton(text="↩️ назад", callback_data="back_to_regime_homework")]
    ]
    markup = types.InlineKeyboardMarkup(inline_keyboard=buttons)

    await callback.message.answer(
        "Выберите неделю для получения всех домашних заданий:",
        reply_markup=markup
    )


async def send_attachment(message: types.Message, telegram_user_id: int, day_name_rus: str, selected_date: datetime, subject: str, attachment: dict, send_type: str):
    existing_file = get_homework_file(
        telegram_user_id, subject, attachment['title'], 
        attachment['url'], selected_date.date()
    )
    if existing_file:
        await message.answer(
            f"📁Файл: {attachment['title']}", 
            reply_to_message_id=existing_file[0][0]
        )
    else:
        if send_type == "file":
            caption = f"{day_name_rus}, {selected_date.day} - {subject} - файл: {attachment['title']}"
            try:
                sent_file_message = await message.answer_document(
                    document=attachment['url'], caption=caption
                )
                save_homework_file(
                    user_id=telegram_user_id, subject=subject, 
                    file_title=attachment['title'], file_url=attachment['url'], 
                    message_id=sent_file_message.message_id, file_date=selected_date.date()
                )
            except TelegramBadRequest as e:
                if "wrong type of the web page content" in str(e):
                    escaped_day_name = escape_md(day_name_rus)
                    escaped_date = escape_md(str(selected_date.day))
                    escaped_subject = escape_md(subject)
                    escaped_title = escape_md(attachment['title'])
                    escaped_url = escape_md(attachment['url'])
                    text_and_url = f"{escaped_day_name}, {escaped_date} \\- {escaped_subject} \\- {escaped_title}\n[скачать файл📲]({escaped_url})"
                    await message.answer(text_and_url, disable_web_page_preview=True, parse_mode=ParseMode.MARKDOWN_V2)
                else:
                    raise
        elif send_type == "link":
            escaped_day_name = escape_md(day_name_rus)
            escaped_date = escape_md(str(selected_date.day))
            escaped_subject = escape_md(subject)
            escaped_title = escape_md(attachment['title'])
            escaped_url = escape_md(attachment['url'])
            text_and_url = f"{escaped_day_name}, {escaped_date} \\- {escaped_subject} \\- {escaped_title}\n[скачать файл📲]({escaped_url})"
            await message.answer(text_and_url, disable_web_page_preview=True, parse_mode=ParseMode.MARKDOWN_V2)

@router.callback_query(F.data.startswith("subject_"))
async def handle_subject_selection_dnev(callback: types.CallbackQuery, state: FSMContext):
    start_time = time.time()
    print(f"⏳ Начало обработки запроса: {time.strftime('%H:%M:%S')}")
    telegram_user_id = callback.message.chat.id

    # 1. Проверка данных пользователя
    if telegram_user_id not in user_data:
        await callback.answer("❌ Ошибка: Информация о пользователе не найдена.", show_alert=True)
        return
    if 'selected_day' not in user_data[telegram_user_id]:
        await callback.answer("❌ Ошибка: День недели не был выбран.", show_alert=True)
        return

    # 2. Получение информации о пользователе
    user_info = fetch_user_info_by_id(telegram_user_id)
    if not user_info or len(user_info) == 0:
        await callback.answer("❌ Ошибка: Информация о пользователе не найдена.", show_alert=True)
        return
    user_record = user_info[0]
    login_value = user_record[4]
    password_value = user_record[5]

    # 3. Авторизация пользователя
    main_info = await login(callback.message, login_value, password_value, action="default", state=state)
    if len(main_info) < 2:
        await callback.answer("❌ Ошибка: Некорректные данные main_info.", show_alert=True)
        return
    internal_user_id, school_name = main_info[0], main_info[1]

    # 4. Получение информации о четверти
    try:
        quarter_id = int(user_data[telegram_user_id]['quarter_id'])
    except KeyError:
        await callback.answer("❌ Ошибка: Информация о четверти не найдена.", show_alert=True)
        return
    
    selected_date = user_data[telegram_user_id]["selected_day"]
    print(selected_date)
    # 5. Поиск данных о дне
    try:
        day_data = await find_day_in_quarter(
            school_name,
            internal_user_id,
            quarter_id=quarter_id,
            telegram_id=telegram_user_id,
            target_date=selected_date
        )
    except Exception as e:
        await callback.message.answer(f"❌ Ошибка при поиске дня: {str(e)}")
        return

    if not day_data:
        await callback.message.answer("❌ Ошибка: Данные о дне не найдены.")
        return

    day_name_eng = selected_date.strftime("%A")
    day_name_rus = {
        "Monday":    "Понедельник",
        "Tuesday":   "Вторник",
        "Wednesday": "Среда",
        "Thursday":  "Четверг",
        "Friday":    "Пятница",
        "Saturday":  "Суббота",
        "Sunday":    "Воскресенье"
    }.get(day_name_eng, "Неизвестный день")

    day_text = f"{day_name_rus}, {selected_date.day}"
    lessons = day_data.get(day_text, [])
    if not lessons or len(lessons) < 2:
        await callback.message.answer("❌ Ошибка: Недостаточно данных для отображения расписания.")
        return

    lessons_without_first = lessons[1:]
    # 6. Формирование ответа пользователю
    if callback.data == "subject_all":
        response = "📚 Все домашние задания:\n\n"
        all_attachments = []  # Список всех вложений

        for lesson in lessons_without_first:
            homework = lesson.get('homework', '')
            subject_full = lesson.get('subject', 'Не указан')
            subject = subject_full.split('. ', 1)[-1]
            emoji = SUBJECT_EMOJIS.get(subject, "📘")

            if homework or lesson.get('attachments'):
                response += f"{emoji} {subject}\n{homework}\n"

                attachments = lesson.get('attachments', [])
                for attachment in attachments:
                    all_attachments.append({
                        "message": callback.message,
                        "telegram_user_id": telegram_user_id,
                        "day_name_rus": day_name_rus,
                        "selected_date": selected_date,
                        "subject": subject,
                        "attachment": attachment,
                        "send_type": attachment['send_type']
                    })

                response += "\n"

        if response == "📚 Все домашние задания:\n\n":
            response += "❌ Нет домашних заданий."

        await callback.message.answer(response)

        # Отправка всех файлов после ответа
        for item in all_attachments:
            await send_attachment(**item)
    else:
        try:
            subject_index = int(callback.data.split('_')[1]) - 1
        except (IndexError, ValueError):
            await callback.answer("❌ Ошибка: Неверный формат данных.", show_alert=True)
            return
        if 0 <= subject_index < len(lessons_without_first):
            lesson = lessons_without_first[subject_index]
            subject_full = lesson.get('subject', 'Не указан')
            subject = subject_full.split('. ', 1)[-1]
            homework = lesson.get('homework', 'Домашнее задание отсутствует')
            if not homework:
                homework = '✖️нет дз'
            emoji = SUBJECT_EMOJIS.get(subject, "📘")
            response = f"{emoji} {subject}\n{homework}"
            await callback.message.answer(response)
            attachments = lesson.get('attachments', [])
            for attachment in attachments:
                send_type = attachment['send_type']
                await send_attachment(
                    message=callback.message,
                    telegram_user_id=telegram_user_id,
                    day_name_rus=day_name_rus,
                    selected_date=selected_date,
                    subject=subject,
                    attachment=attachment,
                    send_type=send_type
                )
        else:
            await callback.answer("❌ Ошибка: Неверный предмет.", show_alert=True)

    total_time = time.time() - start_time
    print(f"🏁 Общее время выполнения запроса: {total_time:.2f} сек")
    await callback.answer()