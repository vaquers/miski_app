from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup

# Определяем состояние для вступления в обсуждение
class DiscussionJoin(StatesGroup):
    waiting_join_text = State()
    waiting_join_attachments = State()


class DiscussionFSM(StatesGroup):
    waiting_for_content = State()
    waiting_for_group_selection = State()
    waiting_for_view_mode = State()
    process_view_mode_for_discussions = State()
    waiting_for_view_mode_find_discussion = State()