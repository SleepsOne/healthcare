from django.urls import path
from .views import chatbot_reply

urlpatterns = [
    path('', chatbot_reply),
]
