from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from appointments.views import AppointmentViewSet

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
]
