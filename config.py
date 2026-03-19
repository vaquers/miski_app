from dotenv import load_dotenv
import os

load_dotenv()

APP_VERSION = "4"

TG_TOKEN = os.getenv("TG_TOKEN")
ADMIN_ID = int(os.getenv("ADMIN_ID", "5584466914"))
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://miski-rho.vercel.app")
API_PORT = int(os.getenv("PORT", os.getenv("API_PORT", "8080")))
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "miski2025")
RAILWAY_API = os.getenv("RAILWAY_API", "https://miskiapp-production.up.railway.app")

MISSES = [
    {"id": "alina", "name": "Алина Василевская"},
    {"id": "nastya", "name": "Настя Коновалова"},
    {"id": "ksyusha", "name": "Ксюша Антонова"},
    {"id": "emiliya", "name": "Эмилия Сидоренко"},
    {"id": "angelina", "name": "Ангелина Самокиш"},
    {"id": "adelya", "name": "Адель Шаповалова"},
    {"id": "polina", "name": "Полина Искорцева"},
    {"id": "sonya", "name": "Соня Ляшевич"},
]
