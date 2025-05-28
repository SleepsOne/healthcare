from django.urls import path, include

urlpatterns = [
    path('api/v1/chatbot/', include('chatbot.urls')),
]