# chatbot/views.py

import json, os, logging
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

logger = logging.getLogger(__name__)

def load_kb():
    kb_path = os.path.join(settings.BASE_DIR, 'kb', 'medical_kb.json')
    try:
        with open(kb_path, encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to load KB: {e}")
        return []

KB = load_kb()

def match_intent(message):
    text = message.lower()
    for item in KB:
        for pattern in item.get('patterns', []):
            if pattern.lower() in text or text in pattern.lower():
                return item['intent'], item['response']
    # fallback
    for item in KB:
        if item.get('intent') == 'fallback':
            return 'fallback', item['response']
    return 'fallback', "Xin lỗi, tôi chưa hiểu câu hỏi của bạn."

@api_view(['POST'])
def chatbot_reply(request):
    message = request.data.get('message')
    if not isinstance(message, str) or not message.strip():
        return Response({'detail':'"message" is required.'},
                        status=status.HTTP_400_BAD_REQUEST)
    intent, reply = match_intent(message.strip())
    return Response({
        'intent': intent,
        'reply': reply
    })
