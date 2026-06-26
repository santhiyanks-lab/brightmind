from django.shortcuts import render
from django.http import HttpResponse

def home(request):
    return HttpResponse("Welcome to BrightMind!")

def chat(request):
    return HttpResponse("Chat endpoint")
