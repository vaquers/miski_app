from dotenv import load_dotenv
import os

load_dotenv()

APP_VERSION = "3"

TG_TOKEN = os.getenv("TG_TOKEN")
ADMIN_ID = int(os.getenv("ADMIN_ID", "5584466914"))
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://miski-rho.vercel.app")
API_PORT = int(os.getenv("PORT", os.getenv("API_PORT", "8080")))

MISSES = [
    {"id": "alina", "name": "Катерина Василевская"},
    {"id": "nastya", "name": "Настя Коновалова"},
    {"id": "ksyusha", "name": "Ксюша Антонова"},
    {"id": "emiliya", "name": "Эмилия Сидоренко"},
    {"id": "angelina", "name": "Ангелина Самокиш"},
    {"id": "adelya", "name": "Адель Шаповалова"},
    {"id": "polina", "name": "Полина Искорцева"},
    {"id": "sonya", "name": "Соня Ляшевич"},
]
