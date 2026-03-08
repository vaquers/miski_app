from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

class TestFSM(StatesGroup):
    waiting_description_for_tests = State()
    waiting_description_for_discussions = State()
    process_description_for_tests = State()
    process_description_for_discussions = State()
    waiting_for_text_for_tests = State()
    waiting_for_text_for_discussions = State()
    waiting_for_question = State()
    waiting_for_test_view_mode = State()
    waiting_for_group_selection = State()


class AdminTestFSM(StatesGroup):
    waiting_for_decision = State()