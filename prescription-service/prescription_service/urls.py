from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from prescriptions.views import PrescriptionViewSet

router = DefaultRouter()
router.register(r'prescriptions', PrescriptionViewSet, basename='prescription')

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include(router.urls)),
]
