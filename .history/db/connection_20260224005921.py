import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()


def fetch_from_db(query, params=None):
    try:
        connection = psycopg2.connect(
            dbname=os.getenv("DB_NAME", "botdb"),
            user=os.getenv("DB_USER", "botuser"),
            host=os.getenv("DB_HOST", "localhost"),
            port=os.getenv("DB_PORT", "5432"),
            password=os.getenv("DB_PASSWORD", ""),
        )
        connection.autocommit = False
        cursor = connection.cursor()
        cursor.execute(query, params)

        if query.strip().lower().startswith("insert") and "returning" in query.lower():
            result = cursor.fetchone()
            connection.commit()
        elif query.strip().lower().startswith(("update", "delete", "insert")):
            connection.commit()
            result = None
        else:
            result = cursor.fetchall()

        cursor.close()
        connection.close()
        return result

    except Exception as e:
        print(f"Ошибка при выполнении запроса: {e}")
        if "connection" in locals() and connection:
            connection.rollback()
            connection.close()
        return None
