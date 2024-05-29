from django.shortcuts import render
from .tasks import test_func
from django.http.response import HttpResponse, HttpResponseRedirect
from django.contrib.auth import get_user_model
from chat.models import ChatModel
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse
from django.shortcuts import get_object_or_404


# Create your views here.
def test(request):
    test_func.delay()
    return HttpResponse("Done")
