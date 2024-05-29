import graphene
import post_app.schema
import authentication.schema
import chat.schema
import familyTree.schema


class Query(
    authentication.schema.Query,
    post_app.schema.Query,
    familyTree.schema.Query,
    chat.schema.Query,
    graphene.ObjectType,
):
    pass


class Mutation(
    authentication.schema.Mutation,
    post_app.schema.Mutation,
    chat.schema.Mutation,
    familyTree.schema.Mutation,
    graphene.ObjectType,
):
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
