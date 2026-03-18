from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from services.marks_service import recent_marks, get_marks_for_quarter, get_marks_for_all_days, marks_quarter
from services.statistics_service import send_full_statistics, send_subject_statistics
from services.schedule_service import get_day_data_by_date
from Tudo_bot.keyboards.main_menu import regime_dnevnik
from Tudo_bot.keyboards.marks import regime_marks
from Tudo_bot.router import router
from datetime import datetime, timedelta
import calendar
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from config import QUARTERS, MONTH_NAMES, WEEKDAYS, user_data, quarter_names, subject_abbreviations
from db.queries.user_queries import fetch_user_info_by_id
from db.connection import fetch_from_db
from utils.text_helpers import format_mark
from aiogram.types import BufferedInputFile
from utils.chart_generator import generate_quarter_table
from utils.time_helpers import send_timer_message
# from services.ai_service import generate_improvement_plan
# from bot.states.grades import GradeImprovementFSM


## хэндлеры отметок
@router.callback_query(F.data.in_(["recent_marks", "week_marks", "statistics_marks", "schedule_marks", "improve_marks", "back_marks"]))
async def handle_marks_button_click(callback: types.CallbackQuery, state: FSMContext):
    telegram_user_id = callback.message.chat.id

    if callback.data == "week_marks":
        await callback.message.edit_text("Выберите неделю для получения отметок:")

        buttons = [
            [types.InlineKeyboardButton(text="прошлая", callback_data="marks_week_past")],
            [types.InlineKeyboardButton(text="текущая", callback_data="marks_week_current")],
            [types.InlineKeyboardButton(text="↩️ назад", callback_data="back_to_regime_marks")]
        ]
        markup = types.InlineKeyboardMarkup(inline_keyboard=buttons)

        await callback.message.answer("Выберите неделю для просмотра отметок:", reply_markup=markup)

    elif callback.data == "recent_marks":
        await callback.message.edit_text("Показываем последние отметки...")
        await recent_marks(callback.message, state)


    elif callback.data == "statistics_marks":
        await callback.message.edit_text("Показываем статистику отметок...")
        await get_marks_for_quarter(callback.message, state=state)

    elif callback.data == "schedule_marks":
        await callback.message.edit_text("Показываем четвертные отметки...")
        await marks_quarter(callback.message, state=state)

    # elif callback.data == "improve_marks":
    #     await show_grade_improvement_menu(callback.message, state)

    elif callback.data == "back_marks":
        await callback.message.delete()
        await regime_dnevnik(callback.message, state=state)

    await callback.answer()
 
@router.callback_query(F.data.startswith("marks_week_") | F.data.eq("back_to_regime_marks"))
async def handle_marks_interaction(callback: types.CallbackQuery, state: FSMContext):
    try:
        telegram_user_id = callback.message.chat.id

        if callback.data.startswith("marks_week_"):
            data_parts = callback.data.split("_")
            if len(data_parts) != 3:
                await callback.answer("❌ Неверный формат callback_data.", show_alert=True)
                return

            week_choice = data_parts[2]
            if week_choice == "past":
                week_str = "прошлая"
            elif week_choice == "current":
                week_str = "текущая"
            else:
                await callback.answer("❌ Неверный выбор недели.", show_alert=True)
                return

            print(f"DEBUG: Пользователь выбрал {week_str} неделю.")
            await callback.message.edit_text(f"выбранная неделя: {week_str}")
            await get_marks_for_all_days(week_str, callback.message, state=state)

        elif callback.data == "back_to_regime_marks":
            markup = regime_marks()
            await callback.message.edit_text("выберите диапазон:", reply_markup=markup)

        await callback.answer()
    except Exception as e:
        print(f"ERROR: {str(e)}")
        await callback.answer("❌ Произошла ошибка при обработке.", show_alert=True)

## хэндлеры статистики
@router.callback_query(F.data.startswith("stats_"))
async def handle_stats_callback(callback: types.CallbackQuery, state: FSMContext):
    """
    Обрабатывает нажатия на инлайн-кнопки статистики.
    Если нажата кнопка "stats_all", загружает полную статистику;
    иначе – статистику по отдельному предмету.
    """
    if callback.data == "stats_all":
        await callback.message.edit_text("📊 Загрузка всей статистики...")
        await send_full_statistics(callback.message, state = state)
    else:
        subject = callback.data.split("_")[1]
        await callback.message.edit_text(f"📊 Загрузка статистики, предмет: {subject} ...")
        await send_subject_statistics(subject, callback.message, state=state)
    await callback.answer()

@router.callback_query(F.data.in_(["84", "85", "86", "87"]))
async def handle_quarter_selection(callback: types.CallbackQuery):
    user_id = callback.message.chat.id
    if user_id not in user_data:
        user_data[user_id] = {}
    user_data[user_id]['quarter_id'] = callback.data
    selected_quarter = quarter_names.get(callback.data, "Неизвестная четверть")
    
    quarter_info = next(((s, e, q) for s, e, q in QUARTERS if q == int(callback.data)), None)
    if not quarter_info:
        await callback.answer("Неверная четверть.", show_alert=True)
        return
    quarter_start, quarter_end, quarter_id = quarter_info
    
    months_in_quarter = set()
    current_date = quarter_start
    while current_date <= quarter_end:
        months_in_quarter.add(current_date.month)
        current_date += timedelta(days=1)
    months_in_quarter = sorted(list(months_in_quarter))

    buttons = [
        [types.InlineKeyboardButton(text=MONTH_NAMES[month], callback_data=f"month_{month}") 
        for month in months_in_quarter[i:i+2]]
        for i in range(0, len(months_in_quarter), 2)
    ]

    markup = types.InlineKeyboardMarkup(inline_keyboard=buttons)


    # Отправляем или редактируем сообщение с клавиатурой
    await callback.answer()
    if callback.message:
        await callback.message.edit_text(
            text=f"Выбранная четверть: {selected_quarter}\nВыберите месяц:",
            reply_markup=markup
        )
    else:
        await callback.bot.send_message(
            chat_id=callback.message.chat.id,
            text="Выберите месяц:",
            reply_markup=markup
        )

@router.callback_query(F.data.startswith("month_"))
async def handle_month_selection(callback: types.CallbackQuery):
    user_id = callback.message.chat.id
    if user_id not in user_data or 'quarter_id' not in user_data[user_id]:
        await callback.answer("Пожалуйста, сначала выберите четверть.", show_alert=True)
        return

    try:
        selected_month = int(callback.data.split('_')[1])
    except (IndexError, ValueError):
        await callback.answer("❌ Неверный формат данных.", show_alert=True)
        return

    user_data[user_id]['month'] = selected_month

    # Получаем информацию о выбранной четверти
    quarter_id = int(user_data[user_id]['quarter_id'])
    quarter_info = next(((s, e, q) for s, e, q in QUARTERS if q == quarter_id), None)
    if not quarter_info:
        await callback.answer("Неверная четверть.", show_alert=True)
        return
    quarter_start, quarter_end, _ = quarter_info

    # Определяем год для выбранного месяца
    year = quarter_start.year if selected_month >= quarter_start.month else quarter_end.year

    try:
        first_day_of_month = datetime(year, selected_month, 1)
    except ValueError:
        await callback.answer("Неверный месяц.", show_alert=True)
        return

    last_day_num = calendar.monthrange(year, selected_month)[1]
    last_day_of_month = datetime(year, selected_month, last_day_num)

    # Корректировка границ месяца в пределах четверти
    first_day = max(first_day_of_month, quarter_start) if selected_month == quarter_start.month else first_day_of_month
    last_day = min(last_day_of_month, quarter_end) if selected_month == quarter_end.month else last_day_of_month

    # Генерируем список рабочих дней (понедельник-пятница)
    valid_days = []
    current_day = first_day
    while current_day <= last_day:
        if current_day.weekday() < 5:
            valid_days.append(current_day.day)
        current_day += timedelta(days=1)

    if not valid_days:
        await callback.answer("В этом месяце нет рабочих дней в выбранной четверти.", show_alert=True)
        return

    buttons = [
        [InlineKeyboardButton(text=str(day), callback_data=f"day_{day}") for day in valid_days[i:i+5]]
        for i in range(0, len(valid_days), 5)
    ]

    markup = InlineKeyboardMarkup(inline_keyboard=buttons)


    await callback.answer()  # Отвечаем на callback
    if callback.message:
        await callback.message.edit_text(
            text=f"Выбранный месяц: {MONTH_NAMES[selected_month]}\nВыберите день:",
            reply_markup=markup
        )
    else:
        await callback.bot.send_message(
            chat_id=callback.message.chat.id,
            text="Выберите день:",
            reply_markup=markup
        )


@router.callback_query(F.data.startswith("day_"))
async def handle_day_selection(callback: types.CallbackQuery, state: FSMContext):
    user_id = callback.message.chat.id
    # Проверяем, что у пользователя есть выбранные четверть и месяц
    if user_id not in user_data or 'quarter_id' not in user_data[user_id] or 'month' not in user_data[user_id]:
        await callback.answer("Пожалуйста, сначала выберите четверть и месяц.", show_alert=True)
        return

    try:
        selected_day = int(callback.data.split('_')[1])
    except (IndexError, ValueError):
        await callback.answer("❌ Неверный формат данных.", show_alert=True)
        return

    selected_month = user_data[user_id]['month']
    quarter_id = int(user_data[user_id]['quarter_id'])
    quarter_info = next(((s, e, q) for s, e, q in QUARTERS if q == quarter_id), None)
    if not quarter_info:
        await callback.answer("Неверная четверть.", show_alert=True)
        return
    quarter_start, quarter_end, _ = quarter_info

    # Определяем год для выбранного месяца
    year = quarter_start.year if selected_month >= quarter_start.month else quarter_end.year

    try:
        selected_date = datetime(year, selected_month, selected_day)
    except ValueError:
        await callback.answer("Неверная дата.", show_alert=True)
        return

    if not (quarter_start <= selected_date <= quarter_end):
        await callback.answer("Дата не входит в выбранную четверть.", show_alert=True)
        return

    # Получаем название дня недели (русский)
    weekday_name = WEEKDAYS[selected_date.weekday()]
    target_day_name = f"{weekday_name}, {selected_day}"
    print(target_day_name)

    await callback.answer(f"Выбранная дата: {target_day_name}")
    if callback.message:
        await callback.message.edit_text(text=f"Выбранная дата: {target_day_name}")
    else:
        await callback.bot.send_message(chat_id=callback.message.chat.id, text=f"Выбранная дата: {target_day_name}")

    # Вызываем функцию для получения данных о дне
    await get_day_data_by_date(selected_date.strftime('%d.%m.%Y'), callback.message, state=state)
## хэндлеры конкретного дня


@router.callback_query(lambda callback: callback.data.startswith("quarter_table:"))
async def handle_quarter_table(callback: types.CallbackQuery):
    """
    Обработчик нажатия на кнопку просмотра таблицы четвертных отметок.
    Генерирует и отправляет изображение с таблицей отметок.
    """
    parts = callback.data.split(":")
    if len(parts) != 2:
        await callback.answer("Неверный формат данных", show_alert=True)
        return
    
    chat_id = int(parts[1])
    if chat_id not in user_data or 'subjects_data' not in user_data[chat_id]:
        await callback.answer("Данные о четвертных отметках не найдены", show_alert=True)
        return
    
    try:
        subjects_data = user_data[chat_id]['subjects_data']
        quarter_averages = user_data[chat_id]['quarter_averages']
        overall_average = user_data[chat_id]['overall_average']
        behavior_data = user_data[chat_id].get('behavior_data') or ["", "", "", ""]
        signature_data = user_data[chat_id].get('signature_data') or ["✕"]*7
        
        img_buffer = await generate_quarter_table(
            subjects_data, quarter_averages,
            overall_average, behavior_data, signature_data
        )
        
        if not img_buffer:
            await callback.answer("Ошибка при создании таблицы", show_alert=True)
            return
        
        photo = BufferedInputFile(file=img_buffer.getvalue(), filename="quarter_marks_table.png")
        await callback.message.answer_photo(photo=photo, caption="📊 Таблица четвертных отметок")
    except Exception as e:
        print(f"Ошибка при обработке четвертных отметок: {str(e)}")
        await callback.answer("Произошла ошибка при обработке", show_alert=True)
    
    await callback.answer()
