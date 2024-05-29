import graphene
from graphene_django import DjangoObjectType
from authentication.models import *
from django.contrib.auth import get_user_model
from jwt import decode, InvalidTokenError
from django.conf import settings
from functools import wraps
from django.db.models import Q
from graphql import GraphQLError
from .tasks import send_follow_notification_email
import base64
import binascii
from django.core.files.base import ContentFile
from django.core.exceptions import PermissionDenied
from django.contrib.auth.hashers import check_password


def authenticate_user(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
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


class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "mobile",
            "profile_picture",
            "bio",
            "date_joined",
            "last_login",
            "gender",
        )


class FollowType(DjangoObjectType):
    class Meta:
        model = Follow
        fields = ("id", "follower", "following", "created_at")


class NotificationType(DjangoObjectType):
    class Meta:
        model = Notification
        fields = (
            "id",
            "user",
            "like_or_comment_user",
            "message",
            "post",
            "created_at",
            "is_seen",
        )


class BlockType(DjangoObjectType):
    class Meta:
        model = Block


class FollowResult(graphene.ObjectType):
    success = graphene.Boolean()
    message = graphene.String()


class Query(graphene.ObjectType):
    user = graphene.Field(UserType)
    followers = graphene.List(UserType, id=graphene.Int())
    following = graphene.List(UserType, id=graphene.Int())
    friend_followers = graphene.List(UserType, id=graphene.ID())
    friend_following = graphene.List(UserType, id=graphene.ID())
    isFollowing = graphene.Boolean(following_id=graphene.ID(required=True))
    friend_suggestions = graphene.List(UserType)
    notifications = graphene.List(NotificationType)
    blocked_users = graphene.List(UserType)

    def resolve_user(self, info):
        try:
            auth_header = info.context.headers.get("Authorization")
            token = auth_header.split(" ")[1] if auth_header else None

            if not token:
                raise PermissionError("Token not provided")

            decoded_token = decode(
                token, settings.SIMPLE_JWT["SIGNING_KEY"], algorithms=["HS256"]
            )
            user_id = decoded_token["user_id"]

            # user = get_user_model().objects.get(id=user_id)
            user = User.objects.get(pk=user_id)

            return user

        except InvalidTokenError:
            raise PermissionError("Invalid token")
        except KeyError:
            raise PermissionError("Token format is invalid")
        except get_user_model().DoesNotExist:
            raise PermissionError("User not found")

    @authenticate_user
    def resolve_followers(self, info, user_id):
        try:
            user = User.objects.get(id=user_id)
            followed_users = [follow.follower for follow in user.followers.all()]
            return followed_users
        except User.DoesNotExist:
            raise GraphQLError("User not found.")

    @authenticate_user
    def resolve_following(self, info, user_id):
        try:
            user = User.objects.get(id=user_id)
            following_users = [follow.following for follow in user.following.all()]
            return following_users
        except User.DoesNotExist:
            raise GraphQLError("User not found")

    @authenticate_user
    def resolve_friend_followers(self, info, user_id, id):
        try:
            user = User.objects.get(id=id)
            followed_users = [follow.follower for follow in user.followers.all()]
            return followed_users
        except User.DoesNotExist:
            raise GraphQLError("User not found.")

    @authenticate_user
    def resolve_friend_following(self, info, user_id, id):
        try:
            user = User.objects.get(id=id)
            following_users = [follow.following for follow in user.following.all()]
            return following_users
        except User.DoesNotExist:
            raise GraphQLError("User not found")

    @authenticate_user
    def resolve_isFollowing(self, info, user_id, following_id):
        try:
            follower_user = User.objects.get(id=user_id)
            following_user = User.objects.get(id=following_id)

            is_following = Follow.objects.filter(
                follower=follower_user, following=following_user
            ).exists()
            return is_following
        except User.DoesNotExist:
            raise GraphQLError("User not found.")

    @authenticate_user
    def resolve_friend_suggestions(self, info, user_id):
        user = User.objects.get(id=user_id)

        already_following_ids = user.following.values_list("following__id", flat=True)

        # Fetch friend suggestions by excluding users already followed by the current user
        suggestions = User.objects.exclude(id=user_id).exclude(
            id__in=already_following_ids
        )[:5]

        return suggestions

    @authenticate_user
    def resolve_notifications(self, info, user_id):
        try:
            user = User.objects.get(id=user_id)
            notifications = Notification.objects.filter(user=user).order_by(
                "-created_at"
            )
            return notifications
        except User.DoesNotExist:
            return None

    @authenticate_user
    def resolve_blocked_users(self, info, user_id):
        user = User.objects.get(id=user_id)
        blocked_users = User.objects.filter(blocked_by__blocker=user)
        return blocked_users


class SearchUsersMutation(graphene.Mutation):
    class Arguments:
        search = graphene.String(required=True)

    matching_users = graphene.List(UserType)

    @authenticate_user
    def mutate(self, info, user_id, search):
        user = get_user_model().objects.get(id=user_id)
        matching_users = User.objects.filter(
            Q(username__icontains=search)
            | Q(first_name__icontains=search)
            | Q(last_name__icontains=search),
        )
        matching_users = matching_users.filter(
            is_active=True, status_activity="active", is_superuser=False
        ).exclude(id=user.id)
        return SearchUsersMutation(matching_users=matching_users)


class AddFollowerMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    Output = FollowResult

    @authenticate_user
    def mutate(self, info, user_id, id):
        try:
            current_user = User.objects.get(id=user_id)
            user_to_follow = User.objects.get(id=id)
            existing_notification = Notification.objects.filter(
                user=user_to_follow,
                like_or_comment_user=current_user,
                message=f"{current_user.first_name} {current_user.last_name} started following you.",
            ).first()
            if existing_notification:
                existing_notification.delete()
            if user_to_follow != current_user:
                Follow.objects.create(follower=current_user, following=user_to_follow)
                Notification.objects.create(
                    user=user_to_follow,
                    like_or_comment_user=current_user,
                    message=f"{current_user.first_name} {current_user.last_name} started following you.",
                )
                send_follow_notification_email.delay(current_user.id, user_to_follow.id)
                return FollowResult(success=True, message="Successfully followed user.")
            else:
                return FollowResult(success=False, message="Cannot follow yourself.")
        except User.DoesNotExist:
            return FollowResult(success=False, message="User not found.")


class RemoveFollowerMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    Output = FollowResult

    @authenticate_user
    def mutate(self, info, user_id, id):
        try:
            current_user = User.objects.get(id=user_id)
            user_to_unfollow = User.objects.get(id=id)
            follow_instance = Follow.objects.get(
                follower=current_user, following=user_to_unfollow
            )
            follow_instance.delete()
            return FollowResult(success=True, message="Successfully unfollowed user.")
        except User.DoesNotExist:
            return FollowResult(success=False, message="User not found.")
        except Follow.DoesNotExist:
            return FollowResult(
                success=False, message="You are not following this user."
            )


class UpdateUserProfileMutation(graphene.Mutation):
    class Arguments:
        first_name = graphene.String()
        last_name = graphene.String()
        bio = graphene.String()
        gender = graphene.String()
        mobile = mobile = graphene.String()
        profile_picture = graphene.String()
        delete_profile_picture = graphene.Boolean()

    user = graphene.Field(UserType)

    @authenticate_user
    def mutate(
        self,
        info,
        user_id,
        first_name=None,
        last_name=None,
        bio=None,
        gender=None,
        mobile=None,
        profile_picture=None,
        delete_profile_picture=False,
    ):

        user = User.objects.get(id=user_id)

        if delete_profile_picture:
            user.profile_picture.delete()

        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name
        if bio:
            user.bio = bio
        if gender:
            user.gender = gender
        if mobile:
            user.mobile = int(mobile)
        if profile_picture:
            try:
                profile_picture = ContentFile(
                    base64.b64decode(profile_picture), name="profile_picture.jpg"
                )
                user.profile_picture = profile_picture
            except (TypeError, binascii.Error) as e:
                return UpdateUserProfileMutation(error="Invalid image data")

        user.save()
        return UpdateUserProfileMutation(user=user)


class MarkNotificationsAsSeen(graphene.Mutation):

    success = graphene.Boolean()

    @authenticate_user
    def mutate(root, info, user_id):
        try:
            user = User.objects.get(id=user_id)
            notifications = Notification.objects.filter(user=user, is_seen=False)
            notifications.update(is_seen=True)
            return MarkNotificationsAsSeen(success=True)
        except User.DoesNotExist:
            return MarkNotificationsAsSeen(success=False)


class ChangePassword(graphene.Mutation):
    class Arguments:
        old_password = graphene.String(required=True)
        new_password = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    @authenticate_user
    def mutate(self, info, user_id, old_password, new_password):
        user = User.objects.get(id=user_id)
        if not check_password(old_password, user.password):
            return ChangePassword(success=False, message="Old password is incorrect")

        user.set_password(new_password)
        user.save()
        return ChangePassword(success=True, message="Password changed successfully")


class BlockUser(graphene.Mutation):
    class Arguments:
        blocked_by = graphene.ID(required=True)

    blocked_user = graphene.Field(BlockType)

    @authenticate_user
    def mutate(self, info, user_id, blocked_by):
        try:
            blocker = User.objects.get(id=user_id)
            blocked = User.objects.get(id=blocked_by)
        except User.DoesNotExist:
            raise Exception("User not found")

        if Block.objects.filter(blocker=blocker, blocked=blocked).exists():
            raise Exception("User is already blocked")

        block = Block.objects.create(blocker=blocker, blocked=blocked)
        return BlockUser(blocked_user=block)


class UnblockUser(graphene.Mutation):
    class Arguments:
        blocked_by = graphene.ID(required=True)

    success = graphene.Boolean()

    @authenticate_user
    def mutate(self, info, user_id, blocked_by):
        try:
            blocker = User.objects.get(id=user_id)
            blocked = User.objects.get(id=blocked_by)
        except User.DoesNotExist:
            raise Exception("User not found")
        block = Block.objects.filter(blocker=blocker, blocked=blocked))
        if block:
            block.delete()
            return UnblockUser(success=True)
        else:
            raise Exception("User is not blocked")


class Mutation(graphene.ObjectType):
    search_users = SearchUsersMutation.Field()
    add_follower = AddFollowerMutation.Field()
    remove_follower = RemoveFollowerMutation.Field()
    update_user_profile = UpdateUserProfileMutation.Field()
    notification_is_seen = MarkNotificationsAsSeen.Field()
    change_password = ChangePassword.Field()
    block_user = BlockUser.Field()
    unblock_user = UnblockUser.Field()
