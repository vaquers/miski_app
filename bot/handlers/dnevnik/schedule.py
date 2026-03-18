from aiogram import Router, types, F
from aiogram.fsm.context import FSMContext
from datetime import datetime, timedelta
from services.schedule_service import get_schedule_for_day, get_day_data_by_date
from utils.date_helpers import get_base_date_for_calculations
from Tudo_bot.keyboards.main_menu import regime_dnevnik
from config import QUARTERS
from Tudo_bot.router import router
from services.schedule_service import get_schedule_for_all_days

@router.callback_query(F.data.in_(["current_day_schedule", "tomorrow_schedule", "choose_day_schedule", "back_schedule", "week_schedule"]))
async def handle_schedule_button_click(callback: types.CallbackQuery, state: FSMContext):

    if callback.data == "current_day_schedule":
        # Редактируем сообщение с выбором расписания
        await callback.message.edit_text("выбранный диапазон: расписание на сегодня")
        today = datetime.now()
        if today.weekday() in [5, 6]:  # Суббота или воскресенье
            next_monday = today + timedelta(days=(7 - today.weekday()))
            date_str = next_monday.strftime('%d.%m.%Y')
            await callback.message.answer(f"Сегодня выходной. Вот расписание на понедельник ({date_str}):")
        else:
            date_str = today.strftime('%d.%m.%Y')
        await get_schedule_for_day(date_str, callback.message, state=state)

    elif callback.data == "tomorrow_schedule":
        await callback.message.edit_text("выбранный диапазон: расписание на завтра")
        tomorrow = datetime.now() + timedelta(days=1)
        if tomorrow.weekday() in [5, 6]:
            next_monday = tomorrow + timedelta(days=(7 - tomorrow.weekday()))
            date_str = next_monday.strftime('%d.%m.%Y')
            await callback.message.answer(f"Завтра выходной. Вот расписание на понедельник ({date_str}):")
        else:
            date_str = tomorrow.strftime('%d.%m.%Y')
        await get_schedule_for_day(date_str, callback.message, state=state)

    elif callback.data == "choose_day_schedule":
        await callback.message.edit_text("Выберите день для расписания, используя кнопку")
        days_of_week = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"]
        buttons = [[types.InlineKeyboardButton(text=day, callback_data=f"choose_day_schedule_{day}")] for day in days_of_week]
        markup = types.InlineKeyboardMarkup(inline_keyboard=buttons)
        await callback.message.answer("Выберите день недели", reply_markup=markup)

    elif callback.data == "week_schedule":
        await callback.message.edit_text("выбранный диапазон: расписание на неделю")
        monday = datetime.now() - timedelta(days=datetime.now().weekday())
        await get_schedule_for_all_days(monday.strftime('%d.%m.%Y'), callback.message, state=state)

    elif callback.data == "back_schedule":
        await callback.message.delete()
        await regime_dnevnik(callback.message, state=state)


@router.callback_query(F.data.startswith("choose_day_schedule_"))
async def handle_day_of_week_selection(callback: types.CallbackQuery, state: FSMContext):
    telegram_user_id = callback.message.chat.id
    print(f"DEBUG: Получены данные callback.data = {callback.data}")

    try:
        data_parts = callback.data.split('_')
        if len(data_parts) < 4:
            await callback.answer("❌ Неверный формат данных для обработки дня.", show_alert=True)
            return

        # Извлекаем день недели (учитываем, что название может содержать символы '_')
        day_of_week = '_'.join(data_parts[3:])
        print(f"DEBUG: Выбран день недели: {day_of_week}")

        days_of_week = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"]
        if day_of_week not in days_of_week:
            await callback.answer("❌ Неверный день недели.", show_alert=True)
            return

        await callback.message.edit_text(f"Выбранный день: {day_of_week}")

        # today = datetime.now()
        # Используем базовую дату для расчетов (с учетом выбранной четверти)
        base_date = get_base_date_for_calculations(telegram_user_id, use_quarter_date=True)

        day_index = days_of_week.index(day_of_week)
        # days_diff = (day_index - today.weekday() + 7) % 7  # Рассчитываем разницу в днях
        # selected_date = today + timedelta(days=days_diff)
        
        # Рассчитываем разницу в днях от базовой даты
        current_day_index = base_date.weekday()
        days_diff = (day_index - current_day_index) % 7
        if days_diff > 0 and current_day_index <= 4:  # Если текущий день рабочий и выбранный день позже
            days_diff = days_diff - 7  # Берем предыдущую неделю
            
        selected_date = base_date + timedelta(days=days_diff)

        date_str = selected_date.strftime('%d.%m.%Y')
        print(f"DEBUG: Расписание на дату: {date_str}")

        # Вызов функции для получения расписания (предполагается, что функция get_schedule_for_day определена)
        await get_schedule_for_day(date_str, callback.message, state=state)

        await callback.answer()
    except Exception as e:
        print(f"ERROR: {str(e)}")
        await callback.answer("❌ Произошла ошибка при обработке.", show_alert=True)
## хэндлеры расписания



## хэндлеры домашнего задания
@router.callback_query(F.data.startswith("day_cur_") | F.data.startswith("day_next_"))
async def handle_day_by_date(callback: types.CallbackQuery, state: FSMContext):
    """
    Обрабатывает нажатия инлайн-кнопок выбора дня текущей/следующей недели.
    Формат callback_data: 'day_cur_YYYYMMDD' или 'day_next_YYYYMMDD'.
    """
    print(f"DEBUG: Получены данные callback.data = {callback.data}")
    try:
        if len(callback.data) < 12:
            await callback.answer("❌ Неверный формат данных для обработки дня.", show_alert=True)
            return

        # Разбиваем строку по символу "_" и получаем дату (третий элемент)
        parts = callback.data.split('_', 2)
        if len(parts) < 3:
            await callback.answer("❌ Неверный формат данных для обработки дня.", show_alert=True)
            return
        date_str = parts[2]
        print(date_str)

        year = int(date_str[:4])
        month = int(date_str[4:6])
        day = int(date_str[6:8])
        selected_date = datetime(year, month, day)
        
        # Вызов асинхронной функции для получения данных о выбранном дне.
        await get_day_data_by_date(selected_date.strftime('%d.%m.%Y'), callback.message, state=state)
        await callback.answer()
    except ValueError:
        await callback.answer("❌ Ошибка: Некорректные данные даты.", show_alert=True)
    except Exception as e:
        await callback.answer(f"❌ Ошибка: {str(e)}", show_alert=True)

## хэндлеры ⬅️ ➡️
@router.callback_query(F.data.startswith("nav_day_"))
async def handle_day_navigation(callback: types.CallbackQuery, state: FSMContext):
    # Извлекаем информацию о текущей дате из callback_data
    parts = callback.data.split('_')
    direction = parts[2]  # prev или next
    current_date_str = parts[3]  # текущая дата в формате DD.MM.YYYY
    
    try:
        current_date = datetime.strptime(current_date_str, "%d.%m.%Y")
        
        # Определяем новую дату в зависимости от направления
        if direction == "prev":
            new_date = current_date - timedelta(days=1)
        else:  # next
            new_date = current_date + timedelta(days=1)
            
        # Форматируем новую дату в нужный формат
        new_date_str = new_date.strftime("%d.%m.%Y")
        
        # Проверяем, не выходные ли это
        if new_date.weekday() in [5, 6]:
            if direction == "prev":
                # Для предыдущего дня получаем предыдущую пятницу
                days_to_friday = (new_date.weekday() - 4) % 7
                new_date = new_date - timedelta(days=days_to_friday)
            else:
                # Для следующего дня получаем следующий понедельник
                days_to_monday = (7 - new_date.weekday()) % 7
                new_date = new_date + timedelta(days=days_to_monday)
            new_date_str = new_date.strftime("%d.%m.%Y")
            
        # Проверяем, входит ли день в диапазон одной из четвертей
        is_in_quarter = any(start_date <= new_date <= end_date for start_date, end_date, _ in QUARTERS)
        if not is_in_quarter:
            await callback.answer("Выбранная дата приходится на каникулы", show_alert=True)
            return
            
        # Получаем данные для нового дня и обновляем сообщение
        await get_day_data_by_date(new_date_str, callback.message, state)
        
        # Удаляем предыдущее сообщение
        await callback.message.delete()
        
    except Exception as e:
        await callback.answer(f"Ошибка при навигации по дням: {str(e)}", show_alert=True)
    
    await callback.answer()