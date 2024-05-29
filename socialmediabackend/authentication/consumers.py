import json
from channels.generic.websocket import AsyncWebsocketConsumer
from authentication.models import User, Notification
from channels.db import database_sync_to_async


class AllNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        my_id = self.scope["user"].id
        self.room_group_name = f"{my_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self):
        self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def send_allNotification(self, event):
        data = json.loads(event.get("value"))
        notifications = data["notifications"]
        await self.send(text_data=json.dumps({"message": notifications}))
