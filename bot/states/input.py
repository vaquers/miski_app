from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

class InputFSM(StatesGroup):
    process_inputs_for_discussions = State()
    process_inputs_for_tests = State()