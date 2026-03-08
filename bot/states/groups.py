from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

class GroupFSM(StatesGroup):
    waiting_for_group_name = State()
    waiting_for_group_description = State()
    waiting_for_group_password = State()
    waiting_for_select_school_group = State()
    waiting_for_group_code = State()
    waiting_for_group_password_join = State()
    waiting_for_view_mode = State()