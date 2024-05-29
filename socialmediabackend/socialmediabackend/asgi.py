"""
ASGI config for socialmediabackend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from chat.consumers import (
    MyWebSocketConsumer,
    MyAsyncWebSocketConsumer,
    PersonalChatConsumer,
    OnlineStatusConsumer,
    NotificationConsumer,
)
from authentication.consumers import AllNotificationConsumer
from channels.auth import AuthMiddlewareStack
from chat.channels_middleware import JWTWebsocketMiddleware

# from chat.schema import MyGraphqlWsConsumer

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "socialmediabackend.settings")


application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": JWTWebsocketMiddleware(
            AuthMiddlewareStack(
                URLRouter(
                    [
                        path("ws/wsc/", MyWebSocketConsumer.as_asgi()),
                        path("ws/asc/", MyAsyncWebSocketConsumer.as_asgi()),
                        # path("ws/graphql/", MyGraphqlWsConsumer.as_asgi()),
                        path("ws/online/", OnlineStatusConsumer.as_asgi()),
                        path("ws/notify/", NotificationConsumer.as_asgi()),
                        # path('ws/notifications/', AllNotificationConsumer.as_asgi()),
                        path("ws/<str:username>/", PersonalChatConsumer.as_asgi()),
                    ]
                )
            )
        ),
    }
)

# application = get_asgi_application()
