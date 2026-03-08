from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

# Класс для управления процессом улучшения отметок
class GradeImprovementFSM(StatesGroup):
    waiting_for_subject_difficulty = State()
    waiting_for_teacher_quality = State()
    waiting_for_cheating_possibility = State()
    waiting_for_subject_specifics = State()
    generating_improvement_plan = State()

class QuarterSelectionFSM(StatesGroup):
    waiting_for_quarter = State()