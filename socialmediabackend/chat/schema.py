# import channels
# import channels.auth
# import channels_graphql_ws
# import graphene
# import asyncio
# from django.contrib.auth.models import User
# from django.utils.timezone import now
# from graphene_django.filter import DjangoFilterConnectionField
# from graphql_auth import mutations
# from graphql_auth.schema import MeQuery
#
# from chat.models import Chat, Message
# from chat.serializers import ChatType, ChatFilter, MessageType, MessageFilter
# from authentication.models import *
# from django.contrib.auth import get_user_model
# from jwt import decode, InvalidTokenError
# from django.conf import settings
# from functools import wraps
# from channels.layers import get_channel_layer
# from asgiref.sync import async_to_sync
#
#
#
#
# def authenticate_user(func):
#     @wraps(func)
#     def wrapper(*args, **kwargs):
#         print(" toke ne ")
#         info = args[1]
#         auth_header = info.context.headers.get("Authorization")
#         token = auth_header.split(" ")[1] if auth_header else None
#
#         if token:
#             try:
#                 decoded_token = decode(
#                     token, settings.SIMPLE_JWT["SIGNING_KEY"], algorithms=["HS256"]
#                 )
#                 user_id = decoded_token["user_id"]
#                 user = get_user_model().objects.get(id=user_id)
#                 return func(*args, user_id=user_id, **kwargs)
#             except (InvalidTokenError, KeyError, get_user_model().DoesNotExist):
#                 pass
#         raise PermissionError("Invalid token or user not found")
#
#     return wrapper
#
#
#
# class Query(MeQuery, graphene.ObjectType):
#     chats = DjangoFilterConnectionField(ChatType, filterset_class=ChatFilter)
#     chat = graphene.Field(ChatType, id=graphene.ID())
#     messages = DjangoFilterConnectionField(
#         MessageType,
#         filterset_class=MessageFilter, id=graphene.ID()
#     )
#
#     @authenticate_user
#     @staticmethod
#     def resolve_chats(cls, info,user_id, **kwargs):
#         user = get_user_model().objects.get(id=user_id)
#         return Chat.objects.prefetch_related("messages", "participants").filter(participants=user)
#
#     @authenticate_user
#     @staticmethod
#     def resolve_chat(cls, info, user_id, id, **kwargs):
#         user = get_user_model().objects.get(id=user_id)
#         return Chat.objects.prefetch_related("participants").get(participants=user, id=id)
#
#     @authenticate_user
#     @staticmethod
#     def resolve_messages(cls, info, user_id, id, **kwargs):
#         user = get_user_model().objects.get(id=user_id)
#         chat = Chat.objects.prefetch_related("messages", "participants").get(participants=user, id=id)
#         return chat.messages.all()
#
#
# class CreateChat(graphene.Mutation):
#     chat = graphene.Field(ChatType)
#     error = graphene.String()
#
#     class Arguments:
#         emails = graphene.String(required=True)
#         chat_room = graphene.String()
#         group = graphene.Boolean()
#
#     @classmethod
#     def mutate(self,root , info, emails, group, chat_room=None):
#         emails = emails.split(",")
#         if not group:
#             if len(emails) > 2:
#                 return CreateChat(error="you cannot have more then two participants if this is not a group")
#             else:
#                 users = []
#                 for email in emails:
#                     user = User.objects.get(email=email)
#                     users.append(user)
#                 # add condition not to create chat for two users twice
#                 chat = Chat.objects.create(
#                     group=False,
#                 )
#                 chat.participants.add(*users)
#                 chat.save()
#         else:
#             users = []
#             for email in emails:
#                 user = User.objects.get(email=email)
#                 users.append(user)
#             chat = Chat.objects.create(
#                 group=True,
#                 chat_room=chat_room
#             )
#             chat.participants.add(*users)
#             chat.save()
#         return CreateChat(chat=chat)
#
#
# # class SendMessage(graphene.Mutation):
# #     message = graphene.Field(MessageType)
# #
# #     class Arguments:
# #         message = graphene.String(required=True)
# #         chat_id = graphene.ID(required=True)
# #
# #     @authenticate_user
# #     @staticmethod
# #     def mutate(self,info ,user_id, message, chat_id):
# #         user = get_user_model().objects.get(id=user_id)
# #         chat = Chat.objects.prefetch_related("participants").get(participants=user, id=chat_id)
# #         message = Message.objects.create(
# #             sender=user,
# #             text=message,
# #             chat=chat
# #         )
# #         users = [usr for usr in chat.participants.all()]
# #         group_name = chat.chat_room
# #         print("users in -",users)
# #         print("group name --",group_name)
# #         for usr in users:
# #             OnNewMessage.broadcast(payload=message, group=group_name)
# #         return SendMessage(message=message)
# #
# #
# #
# #
# # class OnNewMessage(channels_graphql_ws.Subscription):
# #     message = graphene.Field(MessageType)
# #
# #     class Arguments:
# #         chatroom = graphene.String()
# #
# #     @staticmethod
# #     def subscribe(root, info, chatroom=None):
# #         print("chat room -",chatroom,root)
# #         return [chatroom]
# #
# #     @staticmethod
# #     def publish(payload, info, chatroom=None):
# #         print("publish -",payload)
# #         return OnNewMessage(
# #             message=payload
# #         )
# #
# #
# #     @staticmethod
# #     def broadcast(payload, group):
# #         print("payload-", payload)
# #         print("group - ",group)
# #         print("Group type:", type(group))
# #         channel_layer = get_channel_layer()
# #
# #         async def send_message(channel_layer, message, group):
# #             print("in async",message," group -- ",group)
# #             await channel_layer.group_send(
# #                 group,
# #                 {
# #                     'type': 'chat.message',
# #                     'message': message
# #                 }
# #             )
# #             print("message send")
# #
# #
# #
# #
# #
# #
# # class Mutation(graphene.ObjectType):
# #     send_message = SendMessage.Field()
# #     create_chat = CreateChat.Field()
# #
# #
# # class Subscription(graphene.ObjectType):
# #     on_new_message = OnNewMessage.Field()
# #
# #
# # class MyGraphqlWsConsumer(channels_graphql_ws.GraphqlWsConsumer):
# #     schema = graphene.Schema(query=Query, mutation=Mutation, subscription=Subscription)
# #
# #     async def on_connect(self, payload):
# #         print("--- connected --")
# #         self.scope['user'] = await channels.auth.get_user(self.scope)
#
#
# class SendChatMessage(graphene.Mutation, name="SendChatMessagePayload"):  # type: ignore
#     """Send chat message."""
#
#     ok = graphene.Boolean()
#
#     class Arguments:
#         chatroom = graphene.String()
#         text = graphene.String()
#
#
#     @authenticate_user
#     async def mutate(self, info,user_id, chatroom, text):
#         """Mutation "resolver" - store and broadcast a message."""
#
#         # Use the username from the connection scope if authorized.
#         # user = info.context.channels_scope["user"]
#         user = get_user_model().objects.get(id=user_id)
#         print("message --",chatroom,text)
#         chat = Chat.objects.prefetch_related("participants").get(participants=user, chat_room=chatroom)
#         message = Message.objects.create(
#             sender=user,
#             text=text,
#             chat=chat
#         )
#         # Notify subscribers.
#         await OnNewChatMessage.new_chat_message(
#             chatroom=chatroom, text=text, sender=user.username
#         )
#
#         return SendChatMessage(ok=True)
#
#
# class Mutation(graphene.ObjectType):
#     """Root GraphQL mutation."""
#     send_chat_message = SendChatMessage.Field()
#
#
# # ------------------------------------------------------------------------ SUBSCRIPTIONS
#
#
# class OnNewChatMessage(channels_graphql_ws.Subscription):
#     """Subscription triggers on a new chat message."""
#
#     sender = graphene.String()
#     chatroom = graphene.String()
#     text = graphene.String()
#
#     class Arguments:
#         chatroom = graphene.String()
#
#     def subscribe(self, info, chatroom=None):
#         """Client subscription handler."""
#         del info
#         # Specify the subscription group client subscribes to.
#         return [chatroom] if chatroom is not None else None
#
#     def publish(self, info, chatroom=None):
#         """Called to prepare the subscription notification message."""
#
#         # The `self` contains payload delivered from the `broadcast()`.
#         new_msg_chatroom = self["chatroom"]
#         new_msg_text = self["text"]
#         new_msg_sender = self["sender"]
#
#         # Method is called only for events on which client explicitly
#         # subscribed, by returning proper subscription groups from the
#         # `subscribe` method. So he either subscribed for all events or
#         # to particular chatroom.
#         assert chatroom is None or chatroom == new_msg_chatroom
#
#         # Avoid self-notifications.
#         user = info.context.channels_scope["user"]
#         if user.is_authenticated and new_msg_sender == user.username:
#             return None
#
#         return OnNewChatMessage(
#             chatroom=chatroom, text=new_msg_text, sender=new_msg_sender
#         )
#
#     @classmethod
#     async def new_chat_message(cls, chatroom, text, sender):
#         """Auxiliary function to send subscription notifications.
#
#         It is generally a good idea to encapsulate broadcast invocation
#         inside auxiliary class methods inside the subscription class.
#         That allows to consider a structure of the `payload` as an
#         implementation details.
#         """
#         await cls.broadcast(
#             group=chatroom,
#             payload={"chatroom": chatroom, "text": text, "sender": sender},
#         )
#
#
# class Subscription(graphene.ObjectType):
#     """GraphQL subscriptions."""
#
#     on_new_chat_message = OnNewChatMessage.Field()
#
#
# # ----------------------------------------------------------- GRAPHQL WEBSOCKET CONSUMER
#
#
# class MyGraphqlWsConsumer(channels_graphql_ws.GraphqlWsConsumer):
#     """Channels WebSocket consumer which provides GraphQL API."""
#
#     send_keepalive_every = 1
#
#     async def on_connect(self, payload):
#         """Handle WebSocket connection event."""
#
#         # Use auxiliary Channels function `get_user` to replace an
#         # instance of `channels.auth.UserLazyObject` with a native
#         # Django user object (user model instance or `AnonymousUser`)
#         # It is not necessary, but it helps to keep resolver code
#         # simpler. Cause in both HTTP/WebSocket requests they can use
#         # `info.context.channels_scope["user"]`, but not a wrapper. For
#         # example objects of type Graphene Django type
#         # `DjangoObjectType` does not accept
#         # `channels.auth.UserLazyObject` instances.
#         # https://github.com/datadvance/DjangoChannelsGraphqlWs/issues/23
#         self.scope["user"] = await channels.auth.get_user(self.scope)
#
#     schema = graphene.Schema(query=Query, mutation=Mutation, subscription=Subscription)


import graphene
from graphene_django import DjangoObjectType
from .models import ChatModel, ChatNotification
from graphql import GraphQLError
from functools import wraps
from jwt import decode, InvalidTokenError
from django.contrib.auth import get_user_model
from django.conf import settings
from django.db.models import Max, Q
from django.core.exceptions import PermissionDenied


def authenticate_user(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(" toke ne ")
        info = args[1]
        auth_header = info.context.headers.get("Authorization")
        token = auth_header.split(" ")[1] if auth_header else None

        if token:
            try:
                decoded_token = decode(
                    token, settings.SIMPLE_JWT["SIGNING_KEY"], algorithms=["HS256"]
                )
                user_id = decoded_token["user_id"]
                user = get_user_model().objects.get(id=user_id)
                if user.is_active:
                    return func(*args, user_id=user_id, **kwargs)
                else:
                    raise PermissionDenied("User is not active")
            except (InvalidTokenError, KeyError, get_user_model().DoesNotExist):
                pass
        raise PermissionError("Invalid token or user not found")

    return wrapper


class ChatType(DjangoObjectType):
    thread_name = graphene.String()
    id = graphene.Int()
    message = graphene.String()
    is_seen = graphene.Boolean()

    class Meta:
        model = ChatModel
        fields = (
            "id",
            "sender",
            "receiver",
            "message",
            "timestamp",
            "thread_name",
            "is_seen",
        )


class ChatNotificationType(DjangoObjectType):
    class Meta:
        model = ChatNotification


class Query(graphene.ObjectType):
    recent_chats = graphene.List(ChatType, search_query=graphene.String())
    personal_chat = graphene.List(graphene.JSONString, username=graphene.String())

    @authenticate_user
    def resolve_recent_chats(self, info, user_id, search_query=None):
        user = get_user_model().objects.get(id=user_id)

        # Get the distinct thread names associated with the user
        distinct_thread_names = (
            ChatModel.objects.filter(Q(sender=user) | Q(receiver=user))
            .values_list("thread_name", flat=True)
            .distinct()
        )

        recent_chats = []
        for thread_name in distinct_thread_names:
            ids = thread_name[5:].split("-")
            if str(user.id) in ids:
                latest_message = (
                    ChatModel.objects.filter(thread_name=thread_name)
                    .order_by("-timestamp")
                    .first()
                )
                chat_notification = ChatNotification.objects.filter(
                    chat=latest_message
                ).first()

                if latest_message:
                    latest_message.is_seen = (
                        chat_notification.is_seen if chat_notification else False
                    )

                    if search_query:
                        searched_users = get_user_model().objects.filter(
                            Q(first_name__icontains=search_query)
                            | Q(last_name__icontains=search_query)
                            | Q(username__icontains=search_query)
                        )

                        for searched_user in searched_users:
                            if (
                                searched_user == latest_message.sender
                                or searched_user == latest_message.receiver
                            ):
                                recent_chats.append(latest_message)
                                break
                    else:
                        recent_chats.append(latest_message)

        recent_chats.sort(key=lambda x: x.timestamp, reverse=True)
        return recent_chats

    @authenticate_user
    def resolve_personal_chat(self, info, user_id, username):
        try:
            user = get_user_model().objects.get(id=user_id)
            receiver = get_user_model().objects.get(username=username)

            if user.id > receiver.id:
                thread_name = f"chat-{user.id}-{receiver.id}"
            else:
                thread_name = f"chat-{receiver.id}-{user.id}"

            messages = ChatModel.objects.filter(thread_name=thread_name).order_by(
                "timestamp"
            )
            personal_chats = []

            for message in messages:
                sender = message.sender.username
                chat_id = message.id
                timestamp = message.timestamp.isoformat()
                personal_chats.append(
                    {
                        "sender": sender,
                        "message": message.message,
                        "chat_id": chat_id,
                        "timestamp": timestamp,
                    }
                )

            return personal_chats

        except get_user_model().DoesNotExist:
            return None


class UpdateChatNotification(graphene.Mutation):
    class Arguments:
        username = graphene.String(required=True)
        # user_id = graphene.Int(required=True)

    # chat_notification = graphene.Field(ChatNotificationType)
    success = graphene.Boolean()

    @authenticate_user
    def mutate(self, info, username, user_id):
        user = get_user_model().objects.get(username=username)
        reciever = get_user_model().objects.get(id=user_id)
        chat_notification = ChatNotification.objects.filter(
            user=reciever, chat__sender_id=user.id
        )
        if chat_notification.exists():
            chat_notification.update(is_seen=True)
            return UpdateChatNotification(success=True)
        else:
            # raise GraphQLError('Chat notification not found')
            return UpdateChatNotification(success=False)


class Mutation(graphene.ObjectType):
    message_seen = UpdateChatNotification.Field()
