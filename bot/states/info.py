from aiogram.fsm.state import State, StatesGroup

# Определяем состояния для отправки сообщения
class SendMessageStates(StatesGroup):
    waiting_for_user_id_for_send_message = State()
    waiting_for_message = State()
    waiting_for_confirmation = State()


# Состояния для рассылки всем пользователям (с возможностью фото/видео)
class BroadcastStates(StatesGroup):
    waiting_for_content = State()
    waiting_for_confirmation = State()