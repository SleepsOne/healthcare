from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from appointments.views import AppointmentViewSet
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
     # 1. JSON/YAML schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # 2. Swagger UI
    path('api/docs/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # 3. Redoc UI (tuỳ chọn)
    path('api/docs/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns += [
    # 1. raw OpenAPI schema
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    # 2. Swagger UI
    path('api/docs/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # 3. Redoc UI (tuỳ chọn)
    path('api/docs/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
