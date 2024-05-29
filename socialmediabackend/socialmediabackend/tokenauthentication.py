import jwt
from django.contrib.auth import get_user_model
from django.conf import settings
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from channels.db import database_sync_to_async
from datetime import datetime, timedelta

User = get_user_model()


class JWTAuthentication(BaseAuthentication):

    def verify_token(self, payload):  # Change selfs to self
        if "exp" not in payload:
            raise InvalidTokenError("Token has no expirations")

        exp_timestamp = payload["exp"]
        current_timestamp = datetime.utcnow().timestamp()

        if current_timestamp > exp_timestamp:
            raise ExpiredSignatureError("Token has Expired")

    @database_sync_to_async
    def authenticate_websocket(self, scope, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            self.verify_token(payload=payload)  # Corrected selfs to self

            user_id = payload["user_id"]
            user = User.objects.get(id=user_id)
            return user
        except (InvalidTokenError, ExpiredSignatureError, User.DoesNotExist):
            raise AuthenticationFailed("Invalid Token")
