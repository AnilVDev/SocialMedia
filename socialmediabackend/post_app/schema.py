import graphene
import json
from graphene_django import DjangoObjectType
from post_app.models import *
from django.contrib.auth import get_user_model
from jwt import decode, InvalidTokenError
from django.conf import settings
from graphene_file_upload.scalars import Upload
from functools import wraps
from django.core.files.base import ContentFile
import base64
from authentication.models import *
from django.core.files.storage import default_storage
import uuid
from .tasks import (
    send_post_notification_email,
    send_comment_notification_email,
    send_like_notification_email,
)
import random
from django.core.exceptions import PermissionDenied
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


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


def check_superuser(func):
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

                if user.is_superuser:
                    return func(*args, user_id=user_id, **kwargs)
                else:
                    raise PermissionError("User is not a superuser")
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


class PostType(DjangoObjectType):
    class Meta:
        model = Post
        fields = (
            "id",
            "user",
            "description",
            "posted_at",
            "privacy_settings",
            "date_of_memory",
            "image",
        )


class PostMediaType(DjangoObjectType):
    class Meta:
        model = PostMedia
        fields = ("id", "post", "media_type", "media", "video")


class LikeType(DjangoObjectType):
    class Meta:
        model = Like
        fields = ("id", "user", "post", "liked_at")


class CommentType(DjangoObjectType):
    class Meta:
        model = Comment
        fields = ("id", "user", "post", "content", "created_at")


class UserTypeWithPosts(graphene.ObjectType):
    user = graphene.Field(UserType)
    posts = graphene.List(PostType)

    def resolve_user(self, info):
        return self.user

    def resolve_posts(self, info):
        return self.posts


class Query(graphene.ObjectType):
    posts = graphene.List(PostType)
    postmedia = graphene.List(PostMediaType)
    allposts = graphene.List(PostType)
    searchedUser = graphene.Field(
        UserTypeWithPosts, username=graphene.String(required=True)
    )
    isLiked = graphene.Boolean(post_id=graphene.ID(required=True))
    total_likes_for_post = graphene.Int(post_id=graphene.ID(required=True))
    all_comments = graphene.List(CommentType, post_id=graphene.ID(required=True))
    newsfeed_posts = graphene.List(PostType)

    @authenticate_user
    def resolve_posts(self, info, user_id):
        print("graphql * * * ")
        user = get_user_model().objects.get(id=user_id)
        posts = Post.objects.filter(user=user)

        return posts

    @check_superuser
    def resolve_allposts(self, info, user_id):
        allposts = Post.objects.all()
        return allposts

    @authenticate_user
    def resolve_searchedUser(self, info, user_id, username):
        try:
            user = get_user_model().objects.get(username=username)
            does_follow = Follow.objects.filter(
                follower_id=user_id, following=user
            ).exists()
            if does_follow:
                posts = Post.objects.filter(user=user)
            else:
                posts = Post.objects.filter(user=user, privacy_settings=False)
            return UserTypeWithPosts(user=user, posts=posts)
        except get_user_model().DoesNotExist:
            raise ValueError("User not found")

    @authenticate_user
    def resolve_isLiked(self, info, user_id, post_id):
        try:
            user = get_user_model().objects.get(id=user_id)
            post = Post.objects.get(id=post_id)

            is_liked = Like.objects.filter(user=user, post=post).exists()
            return is_liked

        except (get_user_model().DoesNotExist, Post.DoesNotExist):
            return False

    @authenticate_user
    def resolve_total_likes_for_post(self, info, user_id, post_id):
        try:
            total_likes = Like.objects.filter(post_id=post_id).count()
            return total_likes
        except Post.DoesNotExist:
            return 0

    @authenticate_user
    def resolve_all_comments(self, info, user_id, post_id):
        try:
            post = Post.objects.get(id=post_id)
            comments = Comment.objects.filter(post=post).order_by("-created_at")
            return comments

        except Post.DoesNotExist:
            raise ValueError("Post does not exist")

    @authenticate_user
    def resolve_newsfeed_posts(self, info, user_id):
        user = get_user_model().objects.get(id=user_id)

        user_posts = Post.objects.filter(user=user)

        following = Follow.objects.filter(follower=user)
        following_posts = Post.objects.filter(
            user__in=following.values_list("following", flat=True)
        )

        friends_of_friends_posts = Post.objects.filter(
            user__in=Follow.objects.filter(
                follower__in=following.values_list("following", flat=True)
            ).values_list("following", flat=True)
        )

        newsfeed_posts = user_posts.union(following_posts, friends_of_friends_posts)

        if not newsfeed_posts.exists():
            random_posts = Post.objects.order_by("?")[:5]
            newsfeed_posts = random_posts.union(newsfeed_posts)

        newsfeed_posts = newsfeed_posts.order_by("-posted_at")

        return newsfeed_posts


class CreatePostMutation(graphene.Mutation):
    class Arguments:
        user_id = graphene.ID()
        description = graphene.String(required=False)
        privacy_settings = graphene.Boolean(required=False)
        date_of_memory = graphene.Date(required=False)
        image = graphene.String(required=True)

    success = graphene.Boolean()
    post = graphene.Field(PostType)

    @authenticate_user
    def mutate(
        self,
        info,
        user_id,
        description,
        image,
        privacy_settings=False,
        date_of_memory=None,
    ):
        success = True
        user = get_user_model().objects.get(id=user_id)

        try:
            image_data = ContentFile(base64.b64decode(image), name="post_image.jpg")
        except (TypeError, binascii.Error) as e:
            return CreatePostMutation(post=None, error="Invalid image data")

        try:
            # Create the post with the decoded image data
            post = Post.objects.create(
                user=user,
                description=description,
                privacy_settings=privacy_settings,
                date_of_memory=date_of_memory,
                image=image_data,
            )
            print("post saved")
            followers = [follow.follower for follow in user.followers.all()]
            for follower in followers:
                # Notify follower using WebSocket
                channel_layer = get_channel_layer()
                async_to_sync(channel_layer.group_send)(
                    f"{follower.id}",
                    {
                        "type": "send_notification",
                        "value": json.dumps(
                            {
                                "newPostCreated": "new post",
                                # "post_id": post.id
                            }
                        ),
                    },
                )
            send_post_notification_email.delay(user.id)

            return CreatePostMutation(success=True)
        except Exception as e:
            return CreatePostMutation(success=False, error=str(e))


class UpdatePostMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID()
        user_id = graphene.ID()
        description = graphene.String(required=False)
        privacy_settings = graphene.Boolean(required=False)
        date_of_memory = graphene.Date(required=False)

    post = graphene.Field(PostType)
    success = graphene.Boolean()

    @authenticate_user
    def mutate(
        self,
        info,
        id,
        user_id,
        description=None,
        privacy_settings=None,
        date_of_memory=None,
    ):
        user = get_user_model().objects.get(id=user_id)
        post = Post.objects.get(id=id)

        try:
            if post.user != user:
                raise PermissionError("User not authorized to update this post")

            if description is not None:
                post.description = description
            if privacy_settings is not None:
                post.privacy_settings = privacy_settings
            if date_of_memory is not None:
                post.date_of_memory = date_of_memory

            post.save()
            return UpdatePostMutation(post=post, success=True)
        except get_user_model().DoesNotExist:
            raise GraphQLError("User does not exist")
        except Post.DoesNotExist:
            raise GraphQLError("Post does not exist")
        except PermissionError as e:
            raise GraphQLError(str(e))
        except Exception as e:
            raise GraphQLError(str(e))


class DeletePostMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID()

    success = graphene.Boolean()

    @authenticate_user
    def mutate(self, info, id, user_id):
        try:
            user = get_user_model().objects.get(id=user_id)
            post = Post.objects.get(id=id)

            if post.user != user and not user.is_superuser:
                raise PermissionError("User not authorized to delete this post")
            print("user", user)
            post.delete()
            return DeletePostMutation(success=True)

        except Post.DoesNotExist:
            return DeletePostMutation(success=False)


class LikePostMutation(graphene.Mutation):
    class Arguments:
        post_id = graphene.ID(required=True)

    success = graphene.Boolean()
    liked = graphene.Boolean()

    @authenticate_user
    def mutate(self, info, user_id, post_id):
        try:
            user = get_user_model().objects.get(id=user_id)
            post = Post.objects.get(id=post_id)

            existing_like = Like.objects.filter(user=user, post=post).first()
            existing_notification = Notification.objects.filter(
                user=post.user,
                like_or_comment_user=user,
                post=post,
                message=f"{user.first_name} {user.last_name} liked your post",
            ).first()
            # print("existing notify:",existing_notification)
            if existing_like:
                existing_like.delete()
                if existing_notification:
                    existing_notification.delete()
                return LikePostMutation(success=True, liked=False)
            else:
                Like.objects.create(user=user, post=post)

                if user != post.user:
                    if existing_notification:
                        existing_notification.delete()
                    Notification.objects.create(
                        user=post.user,
                        like_or_comment_user=user,
                        message=f"{user.first_name} {user.last_name} liked your post",
                        post=post,
                        is_seen=False,
                    )
                    send_like_notification_email.delay(user.id, post.id)
                return LikePostMutation(success=True, liked=True)

        except Post.DoesNotExist:
            return LikePostMutation(success=False, liked=False)


class AddCommentMutation(graphene.Mutation):
    class Arguments:
        post_id = graphene.ID()
        comment = graphene.String()
        id = graphene.ID()

    success = graphene.Boolean()

    @authenticate_user
    def mutate(self, info, user_id, post_id, comment):
        try:

            post = Post.objects.get(id=post_id)
            user = get_user_model().objects.get(id=user_id)

            # if id:
            #     user = get_user_model().objects.get(id=id)
            # else:
            #     user = get_user_model().objects.get(id=user_id)
            user = get_user_model().objects.get(id=user_id)

            comments = Comment.objects.create(user=user, post=post, content=comment)
            comments.save()
            if user != post.user:
                Notification.objects.create(
                    user=post.user,
                    like_or_comment_user=user,
                    message=f"{user.first_name} {user.last_name} commented on your post",
                    post=post,
                    is_seen=False,
                )
                send_comment_notification_email(user.id, post.id, comment)

            return AddCommentMutation(success=True)
        except Post.DoesNotExist:
            raise ValueError("Post not found")
        except get_user_model().DoesNotExist:
            raise ValueError("User not found")


class DeleteCommentMutation(graphene.Mutation):
    class Arguments:
        comment_id = graphene.ID()

    success = graphene.Boolean(required=True)

    @authenticate_user
    def mutate(self, info, user_id, comment_id):
        try:
            comment = Comment.objects.get(id=comment_id)
            if comment.user_id == user_id or comment.post.user_id == user_id:
                comment.delete()
                return DeleteCommentMutation(success=True)
            else:
                raise PermissionDenied("You are not authorized to delete this comment.")
        except Comment.DoesNotExist:
            return DeleteCommentMutation(success=False)


class Mutation(graphene.ObjectType):
    create_post = CreatePostMutation.Field()
    update_post = UpdatePostMutation.Field()
    delete_post = DeletePostMutation.Field()
    like_post = LikePostMutation.Field()
    add_comment = AddCommentMutation.Field()
    delete_comment = DeleteCommentMutation.Field()
