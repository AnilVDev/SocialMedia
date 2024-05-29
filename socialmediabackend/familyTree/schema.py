import graphene
from graphene_django import DjangoObjectType
from authentication.models import *
from django.contrib.auth import get_user_model
from jwt import decode, InvalidTokenError
from django.conf import settings
from functools import wraps
from django.core.exceptions import PermissionDenied
from familyTree.models import Relationship


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


class UserType(DjangoObjectType):
    class Meta:
        model = User


class RelationshipType(DjangoObjectType):
    class Meta:
        model = Relationship


class Query(graphene.ObjectType):
    user_relationships = graphene.List(RelationshipType)

    @authenticate_user
    def resolve_user_relationships(self, info, user_id):
        return Relationship.objects.filter(from_user_id=user_id)


class CreateRelationship(graphene.Mutation):
    # relationship = graphene.Field(RelationshipType)
    success = graphene.Boolean()
    error_message = graphene.String()

    class Arguments:
        to_user_id = graphene.ID(required=True)
        relationship_type = graphene.String(required=True)

    @authenticate_user
    def mutate(self, info, user_id, to_user_id, relationship_type):
        try:
            from_user = User.objects.get(id=user_id)
            to_user = User.objects.get(id=to_user_id)

            specific_relationship_type = get_specific_relationship(
                relationship_type, from_user.gender, to_user.gender
            )
            print(specific_relationship_type)
            inverse_relationship_type = get_inverse_relationship(
                specific_relationship_type, from_user.gender
            )
            print(inverse_relationship_type)

            existing_relationship = Relationship.objects.filter(
                from_user=from_user,
                to_user=to_user,
            ).exists()

            if existing_relationship:
                raise Exception("The relationship already exists")

            # Create the original relationship
            relationship = Relationship(
                from_user=from_user,
                to_user=to_user,
                relationship_type=specific_relationship_type,
            )
            print(relationship)
            relationship.save()

            # Create the inverse relationship
            inverse_relationship = Relationship(
                from_user=to_user,
                to_user=from_user,
                relationship_type=inverse_relationship_type,
            )
            print(inverse_relationship)
            inverse_relationship.save()

            return CreateRelationship(success=True)
        except Exception as e:
            return CreateRelationship(success=False, error_message=str(e))


def get_specific_relationship(relationship_type, from_user_gender, to_user_gender):
    print(relationship_type, from_user_gender, to_user_gender)
    specific_relationships = {
        "parent": {"male": "father", "female": "mother"},
        "child": {"male": "son", "female": "daughter"},
        "sibling": {"male": "brother", "female": "sister"},
        "partner": {"male": "husband", "female": "wife"},
    }

    if relationship_type in specific_relationships:
        specific = specific_relationships[relationship_type]
        if isinstance(
            specific, dict
        ):  # Check if the specific relationship is gender-dependent
            return specific[to_user_gender]
        return specific
    else:
        raise ValueError(f"Unsupported relationship type: {relationship_type}")


def get_inverse_relationship(relationship_type, to_user_gender):
    inverse_relationships = {
        "father": {"male": "son", "female": "daughter"},
        "mother": {"male": "son", "female": "daughter"},
        "son": {"male": "father", "female": "mother"},
        "daughter": {"male": "father", "female": "mother"},
        "brother": {"male": "brother", "female": "sister"},
        "sister": {"male": "brother", "female": "sister"},
        "husband": "wife",
        "wife": "husband",
    }

    if relationship_type in inverse_relationships:
        inverse_relationship = inverse_relationships[relationship_type]
        if isinstance(
            inverse_relationship, dict
        ):  # Check if the specific relationship is gender-dependent
            return inverse_relationship[to_user_gender]
        return inverse_relationship
    else:
        raise ValueError(f"Unsupported relationship type: {relationship_type}")


class DeleteRelationship(graphene.Mutation):
    success = graphene.Boolean()

    class Arguments:
        to_user_id = graphene.ID(required=True)

    @authenticate_user
    def mutate(self, info, user_id, to_user_id):
        from_user = User.objects.get(id=user_id)
        to_user = User.objects.get(id=to_user_id)

        original_relationship = Relationship.objects.filter(
            from_user=from_user,
            to_user=to_user,
        ).first()

        if original_relationship:
            original_relationship.delete()

        # Find and delete the inverse relationship
        inverse_relationship = Relationship.objects.filter(
            from_user=to_user,
            to_user=from_user,
        ).first()

        if inverse_relationship:
            inverse_relationship.delete()

        return DeleteRelationship(success=True)


class Mutation(graphene.ObjectType):
    create_relationship = CreateRelationship.Field()
    delete_relationship = DeleteRelationship.Field()
