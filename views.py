from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .serializers import ParentRegisterSerializer, ChildRegisterSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def parent_register(request):
    s = ParentRegisterSerializer(data=request.data)
    if s.is_valid():
        user  = s.save()
        token = Token.objects.create(user=user)
        return Response({'token': token.key, 'role': 'parent'},
                        status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_child(request):
    if not request.user.is_parent():
        return Response({'error': 'Only parents can add children'},
                        status=status.HTTP_403_FORBIDDEN)
    s = ChildRegisterSerializer(data=request.data,
                                context={'request': request})
    if s.is_valid():
        child = s.save()
        token, _ = Token.objects.get_or_create(user=child)  # avoid duplicate token error
        return Response({'token': token.key, 'role': 'child'},
                        status=status.HTTP_201_CREATED)
    return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not username or not password:
        return Response({'error': 'Username and password are required'},
                        status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    if not user:
        return Response({'error': 'Invalid credentials'},
                        status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)

    profile = {}
    if user.is_child():
        cp = user.child_profile
        profile = {
            'age':      cp.age,
            'language': cp.language,
            'points':   cp.points,
            'avatar':   cp.avatar.url if cp.avatar else None,
        }

    return Response({
        'token':   token.key,
        'role':    user.role,
        'profile': profile,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Return current user info — useful for frontend on app load."""
    user = request.user
    profile = {}
    if user.is_child():
        cp = user.child_profile
        profile = {
            'age':        cp.age,
            'language':   cp.language,
            'points':     cp.points,
            'avatar':     cp.avatar.url if cp.avatar else None,
            'screen_mins': cp.screen_mins,
        }
    elif user.is_parent():
        pp = user.parent_profile
        profile = {
            'phone': pp.phone,
        }
    return Response({
        'username': user.username,
        'role':     user.role,
        'profile':  profile,
    })