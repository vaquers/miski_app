import secrets
import json
import aiohttp
from aiohttp import web

from config import ADMIN_PASSWORD, RAILWAY_API, MISSES
from bot.visibility import load_visibility
from bot.voting_control import load_status, set_voting

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

_admin_tokens: set[str] = set()


def _check_auth(request: web.Request) -> bool:
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:] in _admin_tokens
    return False


# ── Public endpoints ─────────────────────────────────────────────

async def handle_visibility(request: web.Request) -> web.Response:
    data = load_visibility()
    return web.json_response(data, headers=CORS_HEADERS)


async def handle_voting_status(request: web.Request) -> web.Response:
    data = load_status()
    return web.json_response(data, headers=CORS_HEADERS)


async def handle_options(request: web.Request) -> web.Response:
    return web.Response(headers=CORS_HEADERS)


# ── Admin endpoints ──────────────────────────────────────────────

async def handle_admin_login(request: web.Request) -> web.Response:
    try:
        body = await request.json()
    except Exception:
        return web.json_response(
            {"error": "invalid body"}, status=400, headers=CORS_HEADERS
        )

    if body.get("password") != ADMIN_PASSWORD:
        return web.json_response(
            {"error": "wrong password"}, status=401, headers=CORS_HEADERS
        )

    token = secrets.token_urlsafe(32)
    _admin_tokens.add(token)
    return web.json_response({"token": token}, headers=CORS_HEADERS)


async def handle_admin_voting_status_get(request: web.Request) -> web.Response:
    if not _check_auth(request):
        return web.json_response(
            {"error": "unauthorized"}, status=401, headers=CORS_HEADERS
        )
    data = load_status()
    return web.json_response(data, headers=CORS_HEADERS)


async def handle_admin_voting_status_post(request: web.Request) -> web.Response:
    if not _check_auth(request):
        return web.json_response(
            {"error": "unauthorized"}, status=401, headers=CORS_HEADERS
        )
    try:
        body = await request.json()
    except Exception:
        return web.json_response(
            {"error": "invalid body"}, status=400, headers=CORS_HEADERS
        )

    nomination = body.get("nomination")
    is_open = body.get("open")
    if nomination not in ("defile", "photos") or not isinstance(is_open, bool):
        return web.json_response(
            {"error": "need nomination (defile|photos) and open (bool)"},
            status=400,
            headers=CORS_HEADERS,
        )

    data = set_voting(nomination, is_open)
    return web.json_response(data, headers=CORS_HEADERS)


async def handle_admin_results(request: web.Request) -> web.Response:
    if not _check_auth(request):
        return web.json_response(
            {"error": "unauthorized"}, status=401, headers=CORS_HEADERS
        )
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{RAILWAY_API}/api/results", timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                data = await resp.json()
                return web.json_response(data, headers=CORS_HEADERS)
    except Exception as e:
        return web.json_response(
            {"error": str(e)}, status=502, headers=CORS_HEADERS
        )


async def handle_admin_voters(request: web.Request) -> web.Response:
    if not _check_auth(request):
        return web.json_response(
            {"error": "unauthorized"}, status=401, headers=CORS_HEADERS
        )
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{RAILWAY_API}/api/voters", timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                data = await resp.json()
                return web.json_response(data, headers=CORS_HEADERS)
    except Exception as e:
        return web.json_response(
            {"error": str(e)}, status=502, headers=CORS_HEADERS
        )


async def handle_admin_misses(request: web.Request) -> web.Response:
    if not _check_auth(request):
        return web.json_response(
            {"error": "unauthorized"}, status=401, headers=CORS_HEADERS
        )
    return web.json_response(MISSES, headers=CORS_HEADERS)


# ── App factory ──────────────────────────────────────────────────

def create_app() -> web.Application:
    app = web.Application()

    # Public
    app.router.add_get("/api/visibility", handle_visibility)
    app.router.add_get("/api/voting-status", handle_voting_status)
    app.router.add_route("OPTIONS", "/api/visibility", handle_options)
    app.router.add_route("OPTIONS", "/api/voting-status", handle_options)

    # Admin
    app.router.add_post("/api/admin/login", handle_admin_login)
    app.router.add_route("OPTIONS", "/api/admin/login", handle_options)

    app.router.add_get("/api/admin/voting-status", handle_admin_voting_status_get)
    app.router.add_post("/api/admin/voting-status", handle_admin_voting_status_post)
    app.router.add_route("OPTIONS", "/api/admin/voting-status", handle_options)

    app.router.add_get("/api/admin/results", handle_admin_results)
    app.router.add_route("OPTIONS", "/api/admin/results", handle_options)

    app.router.add_get("/api/admin/voters", handle_admin_voters)
    app.router.add_route("OPTIONS", "/api/admin/voters", handle_options)

    app.router.add_get("/api/admin/misses", handle_admin_misses)
    app.router.add_route("OPTIONS", "/api/admin/misses", handle_options)

    return app
