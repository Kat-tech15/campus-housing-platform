from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .serializers import ProfileSerializer, ProfileSerializer, UserSerializer, VerifyEmailSerializer, LoginSerializer, EmptySerializer
from .models import CustomUser, Profile
from django.core.mail import send_mail
from drf_spectacular.utils import extend_schema
from django.conf import settings
from django.contrib.auth import authenticate    


@extend_schema(tags=['Accounts'])
class RegisterView(generics.CreateAPIView):
    serializer_class = UserSerializer
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

    
        # Send verification email
        send_mail(
            subject="Verify your email",
            message=f"Your verification code is {user.verification_code}.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )
    
        return Response({"message": "User registered successfully. Please check your email to verify your account."}, status=status.HTTP_201_CREATED)
    
@extend_schema(tags=['Accounts'])
class VerifyEmailView(generics.GenericAPIView):
    serializer_class = VerifyEmailSerializer
    permission_classes = [permissions.AllowAny]

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

@extend_schema(tags=['Accounts'])      
class LoginView(generics.CreateAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

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

  
@extend_schema(tags=['Accounts'])
class LogoutView(generics.CreateAPIView):
    serializer_class = EmptySerializer
    permission_classes = [permissions.IsAuthenticated]  

    def post(self, request, *args, **kwargs):
        return Response({"message": "Logout successful."}, status=status.HTTP_200_OK)
    

@extend_schema(tags=['Accounts'])
class UpdateProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()
    permission_classes = [permissions.IsAuthenticated] 

    def get_object(self):
        return self.request.user.profile