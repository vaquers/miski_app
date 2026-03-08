"""Обработчики оплаты через Telegram Stars: pre_checkout и successful_payment."""
from aiogram import types
from aiogram.filters import BaseFilter
from Tudo_bot.router import router
from db.queries.subscription_queries import (
    extend_subscription_by_days,
    insert_payment,
    set_subscription_forever,
    SUBSCRIPTION_DAYS,
)


class SuccessfulPaymentFilter(BaseFilter):
    async def __call__(self, message: types.Message) -> bool:
        return message.successful_payment is not None


@router.pre_checkout_query()
async def process_pre_checkout(pre_checkout: types.PreCheckoutQuery):
    """Подтверждаем платёж (обязательно ответить в течение 10 секунд)."""
    await pre_checkout.answer(ok=True)


@router.message(SuccessfulPaymentFilter())
async def process_successful_payment(message: types.Message):
    """После успешной оплаты: сохраняем платёж, продлеваем подписку на 31 день или даём доступ навсегда."""
    payment = message.successful_payment
    if not payment or payment.currency != "XTR":
        return

    payload = payment.invoice_payload or ""
    if payload.startswith("forever_"):
        try:
            telegram_id = int(payload.replace("forever_", ""))
        except ValueError:
            return
        insert_payment(
            user_id=telegram_id,
            amount_stars=payment.total_amount,
            telegram_payment_charge_id=payment.telegram_payment_charge_id,
            provider_payment_charge_id=payment.provider_payment_charge_id or "",
            invoice_payload=payload,
        )
        set_subscription_forever(telegram_id)
        await message.answer("✅ Оплата прошла успешно. Доступ к приложению — навсегда. Можете пользоваться.")
        return

    if not payload.startswith("sub_"):
        return
    try:
        telegram_id = int(payload.replace("sub_", ""))
    except ValueError:
        return

    insert_payment(
        user_id=telegram_id,
        amount_stars=payment.total_amount,
        telegram_payment_charge_id=payment.telegram_payment_charge_id,
        provider_payment_charge_id=payment.provider_payment_charge_id or "",
        invoice_payload=payload,
    )
    extend_subscription_by_days(telegram_id, SUBSCRIPTION_DAYS)

    await message.answer(
        f"✅ Оплата прошла успешно. Подписка продлена на {SUBSCRIPTION_DAYS} дней. Можете пользоваться приложением."
    )
