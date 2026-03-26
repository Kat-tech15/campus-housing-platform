from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import UserSerializer, VerifyEmailSerializer, LoginSerializer, EmptySerializer
from .models import CustomUser
from django.contrib.auth import authenticate    


class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    queryset = CustomUser.objects.all()

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response({"message": "User registered successfully. Please check your email to verify your account."}, status=status.HTTP_201_CREATED)
    

class VerifyEmailView(generics.GenericAPIView):
    serializer_class = VerifyEmailSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data['code']

        try:
            user = CustomUser.objects.get(verification_code=code)
            user.email_verified = True
            user.is_active = True
            user.save()
            return Response({"message": "Email verified successfully. You can now log in."}, status=status.HTTP_200_OK)
        except CustomUser.DoesNotExist:
            return Response({"error": "Invalid verification code."}, status=status.HTTP_400_BAD_REQUEST)
        
class LoginView(generics.CreateAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']

        user = authenticate(request, username=username, password=password)

        if user is not None:
            if user.email_verified:
                return Response({"message": "Login successful."}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Email not verified. Please verify your email before logging in."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"error": "Invalid username or password."}, status=status.HTTP_400_BAD_REQUEST)
        
class LogoutView(generics.CreateAPIView):
    serializer_class = EmptySerializer

    def post(self, request, *args, **kwargs):
        return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)