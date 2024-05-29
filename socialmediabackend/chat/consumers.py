import json
from channels.generic.websocket import (
    WebsocketConsumer,
    AsyncWebsocketConsumer,
    AsyncJsonWebsocketConsumer,
)
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from chat.models import ChatModel, UserProfileModel, ChatNotification
from django.db import IntegrityError

User = get_user_model()


class MyWebSocketConsumer(WebsocketConsumer):
    def connect(self):
        print("Websocket connected..")
        self.accept()

    def receive(self, text_data=None, bytes_data=None):
        print("Message Received from Client ..", text_data)
        self.send(text_data="message from server to client , your message is received")

    def disconnect(self, close_data):
        print("Websocket disconnected ..", close_data)


class MyAsyncWebSocketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Websocket connected..")
        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        print("Message Received from Client ..", text_data)
        await self.send(
            text_data="message from async server to client , your message is received"
        )

    async def disconnect(self, close_data):
        print("Websocket disconnected ..", close_data)


class PersonalChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("connected")
        user = self.scope["user"]
        my_id = user.id if user.is_authenticated else None
        other_username = self.scope["url_route"]["kwargs"]["username"]
        other_user = await database_sync_to_async(User.objects.get)(
            username=other_username
        )
        other_user_id = other_user.id
        if int(my_id) > int(other_user_id):
            self.room_name = f"{my_id}-{other_user_id}"
        else:
            self.room_name = f"{other_user_id}-{my_id}"

        self.room_group_name = "chat-%s" % self.room_name

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        print(data)
        message = data["message"]
        username = data["username"]
        receiver = data["receiver"]

        await self.save_message(username, self.room_group_name, message, receiver)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "username": username,
            },
        )

    async def chat_message(self, event):
        message = event["message"]
        username = event["username"]

        await self.send(
            text_data=json.dumps({"message": message, "username": username})
        )

    async def disconnect(self, code):
        self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    @database_sync_to_async
    def save_message(self, username, thread_name, message, receiver):
        sender = User.objects.get(username=username)
        receiverUser = User.objects.get(username=receiver)
        chat_obj = ChatModel.objects.create(
            sender=sender,
            receiver=receiverUser,
            message=message,
            thread_name=thread_name,
        )
        other_username = self.scope["url_route"]["kwargs"]["username"]
        get_user = User.objects.get(username=other_username)
        if receiver == get_user.username:
            ChatNotification.objects.create(chat=chat_obj, user=get_user)


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        my_id = self.scope["user"].id
        self.room_group_name = f"{my_id}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, code):
        self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def send_notification(self, event):
        print("event :", event)
        data = json.loads(event.get("value"))
        # count = data['count']
        # print(count)
        await self.send(text_data=json.dumps(data))


class OnlineStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "online_users"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        username = data["username"]
        connection_type = data["type"]
        print(connection_type)
        await self.change_online_status(username, connection_type)

    async def send_onlineStatus(self, event):
        data = json.loads(event.get("value"))
        username = data["username"]
        online_status = data["status"]
        await self.send(
            text_data=json.dumps({"username": username, "online_status": online_status})
        )

    async def disconnect(self, message):
        self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    @database_sync_to_async
    def change_online_status(self, username, c_type):
        try:
            user = User.objects.get(username=username)
            userprofile, created = UserProfileModel.objects.get_or_create(user=user)
            if c_type == "open":
                userprofile.online_status = True
            else:
                userprofile.online_status = False
            userprofile.save()

        except IntegrityError:
            print(f"User with username {username} does not exist.")
