from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, ChildProfile, ParentProfile


class ParentRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]  # enforces Django password rules
    )

    class Meta:
        model  = User
        fields = ['username', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username = validated_data['username'],
            email    = validated_data['email'],
            password = validated_data['password'],
            role     = User.PARENT,
        )
        ParentProfile.objects.create(user=user)
        return user


class ChildRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    age      = serializers.IntegerField(min_value=3, max_value=17)
    language = serializers.ChoiceField(choices=['tamil', 'english', 'hindi'])

    class Meta:
        model  = User
        fields = ['username', 'password', 'age', 'language']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def create(self, validated_data):
        parent   = self.context['request'].user
        age      = validated_data.pop('age')
        language = validated_data.pop('language')

        user = User.objects.create_user(
            username = validated_data['username'],
            password = validated_data['password'],
            role     = User.CHILD,
            language = language,
        )
        ChildProfile.objects.create(
            user=user, parent=parent, age=age, language=language
        )
        return user