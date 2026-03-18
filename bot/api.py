from aiohttp import web
from bot.visibility import load_visibility

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


async def handle_visibility(request: web.Request) -> web.Response:
    data = load_visibility()
    return web.json_response(data, headers=CORS_HEADERS)


async def handle_options(request: web.Request) -> web.Response:
    return web.Response(headers=CORS_HEADERS)


def create_app() -> web.Application:
    app = web.Application()
    app.router.add_get("/api/visibility", handle_visibility)
    app.router.add_route("OPTIONS", "/api/visibility", handle_options)
    return app
