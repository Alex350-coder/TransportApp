"""Auth endpoints: register, JWT token pair/refresh, me."""
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.core.throttles import AuthRateThrottle

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_classes = (AuthRateThrottle,)


class ThrottledTokenObtainPairView(TokenObtainPairView):
    throttle_classes = (AuthRateThrottle,)


class ThrottledTokenRefreshView(TokenRefreshView):
    throttle_classes = (AuthRateThrottle,)


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user
