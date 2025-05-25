from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from doctors.views import DoctorViewSet

router = DefaultRouter()
router.register(r'doctors', DoctorViewSet, basename='doctor')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
]
