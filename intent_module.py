# ═══ INTENT TAGGING MODULE ═══
import re as _re_intent
import os as _os_intent
import json as _json_intent

INTENT_PATTERNS = {
    'rezervare': [
        r'rezerv', r'masa', r'programare', r'appointment', r'booking',
        r'disponibil', r'locuri', r'cand pot', r'vreau sa vin', r'vin la',
        r'reserva', r'rezervare', r'pentru (\d+|doi|trei|patru|cinci)',
        r'ora (\d+)', r'maine', r'poimaine', r'saptamana', r'diseara'
    ],
    'pret': [
        r'pret', r'cost', r'cat costa', r'tarif', r'oferta', r'buget',
        r'ieftin', r'scump', r'discount', r'reducere', r'promotie',
        r'gratuit', r'free', r'preturi', r'lista pret', r'cat e',
        r'ce pret', r'pretul', r'costa', r'banii', r'plata'
    ],
    'suport': [
        r'ajutor', r'problema', r'nu merge', r'eroare', r'broken',
        r'help', r'support', r'asistenta', r'reclamatii', r'plangere',
        r'nu functioneaza', r'defect', r'stricat', r'reparatie',
        r'garantie', r'retur', r'schimb', r'refund', r'banii inapoi'
    ],
    'vanzare': [
        r'cumpar', r'comanda', r'vreau sa', r'achizitionez', r'buy',
        r'order', r'livrare', r'delivery', r'disponibil', r'in stoc',
        r'produs', r'serviciu', r'pachet', r'abonament', r'contract',
        r'oferta speciala', r'negociere', r'propunere', r'colaborare'
    ],
    'meniu': [
        r'meniu', r'mancare', r'feluri', r'preparate', r'restorant',
        r'pizza', r'supa', r'salata', r'desert', r'bauturi', r'vin',
        r'bere', r'cafea', r'mic dejun', r'pranz', r'cina', r'gustare',
        r'ingredient', r'alerg', r'vegan', r'vegetarian', r'fara gluten'
    ],
    'program': [
        r'program', r'orar', r'deschis', r'inchi', r'ora', r'weekend',
        r'luni', r'marti', r'miercuri', r'joi', r'vineri', r'sambata',
        r'duminica', r'non-stop', r'noaptea', r'dimineata', r'seara'
    ],
    'contact': [
        r'adresa', r'locatie', r'unde', r'contact', r'telefon', r'email',
        r'harta', r'google maps', r'cum ajung', r'parcare', r'acces'
    ]
}

def classify_intent(message):
    """Clasifica intentia unui mesaj folosind regex patterns + AI fallback"""
    message_lower = message.lower().strip()
    
    # Regex-based classification (fast, free)
    scores = {}
    for intent, patterns in INTENT_PATTERNS.items():
        score = sum(1 for p in patterns if _re_intent.search(p, message_lower))
        if score > 0:
            scores[intent] = score
    
    if scores:
        top_intent = max(scores, key=scores.get)
        confidence = min(scores[top_intent] / 3.0, 1.0)
        return {
            'intent': top_intent,
            'confidence': round(confidence, 2),
            'method': 'regex',
            'all_scores': scores
        }
    
    # Fallback: use Kimi AI for classification
    try:
        from openai import OpenAI
        kimi = OpenAI(
            base_url='https://api.moonshot.ai/v1',
            api_key=_os_intent.getenv('KIMI_API_KEY')
        )
        prompt = f"""Clasifica intentia acestui mesaj intr-una din categoriile: rezervare, pret, suport, vanzare, meniu, program, contact, general.

Mesaj: "{message}"

Raspunde DOAR cu JSON: {{"intent": "categoria", "confidence": 0.0-1.0}}"""
        
        res = kimi.chat.completions.create(
            model='kimi-k2.6',
            messages=[{'role': 'user', 'content': prompt}],
            max_tokens=100,
            temperature=0.1,
            thinking={'type': 'disabled'}
        )
        
        result = _json_intent.loads(res.choices[0].message.content.strip())
        return {
            'intent': result.get('intent', 'general'),
            'confidence': result.get('confidence', 0.5),
            'method': 'kimi-ai',
            'all_scores': {}
        }
    except Exception as e:
        return {
            'intent': 'general',
            'confidence': 0.3,
            'method': 'fallback',
            'all_scores': {}
        }
