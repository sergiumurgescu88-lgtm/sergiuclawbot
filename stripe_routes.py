from flask import Blueprint, request, jsonify, current_app
import stripe, os, sqlite3, jwt
from functools import wraps

# Blueprint FĂRĂ prefix — server.py va adăuga /api/stripe la înregistrare
stripe_bp = Blueprint('stripe', __name__)

def _verify_token(auth_header):
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    try:
        import hashlib, base64, json as _json
        token = auth_header.split(' ')[1]
        parts = token.split('.')
        if len(parts) != 3:
            return None
        secret = current_app.config.get('SECRET_KEY', os.getenv('FLASK_SECRET_KEY'))
        expected_sig = hashlib.sha256(f"{parts[0]}.{parts[1]}.{secret}".encode()).hexdigest()
        if parts[2] != expected_sig:
            return None
        padding = 4 - len(parts[1]) % 4
        payload = _json.loads(base64.urlsafe_b64decode(parts[1] + '=' * padding))
        return payload.get('sub') or payload.get('user_id')
    except:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        user_id = _verify_token(auth)
        if not user_id:
            return jsonify({'success': False, 'error': 'Unauthorized'}), 401
        db_path = os.getenv('DB_PATH', '/var/www/agentulmeu.online/config/agentulmeu.db')
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        c.execute('SELECT id, username, email FROM users WHERE id=?', (user_id,))
        user = c.fetchone()
        conn.close()
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 401
        return f({'id': user[0], 'username': user[1], 'email': user[2]}, *args, **kwargs)
    return decorated

# RUTA SIMPLĂ: /create-checkout — prefixul vine din server.py
@stripe_bp.route('/create-checkout', methods=['POST'])
@token_required
def create_checkout(current_user):
    try:
        if not request.is_json:
            return jsonify({'success': False, 'error': 'JSON required'}), 400
        data = request.get_json() or {}
        plan = data.get('plan', 'starter')
        plan_map = {'starter':'STARTER','professional':'PRO','doneforyou':'DFY'}
        price_id = os.getenv(f"STRIPE_PRICE_{plan_map.get(plan,'STARTER')}")
        if not price_id or 'REPLACE' in price_id:
            return jsonify({'success': False, 'error': f'Price {plan} not configured'}), 500
        mode = 'payment' if plan == 'doneforyou' else 'subscription'
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{'price': price_id, 'quantity': 1}],
            mode=mode,
            success_url=f"https://agentulmeu.online/success?plan={plan}",
            cancel_url="https://agentulmeu.online/cancel",
            metadata={'user_id': str(current_user['id']), 'plan': plan}
        )
        return jsonify({'success': True, 'url': session.url, 'session_id': session.id}), 200
    except Exception as e:
        current_app.logger.error(f"Stripe error: {e}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@stripe_bp.route("/webhook", methods=["POST"])
def stripe_webhook():
    """Handle Stripe webhook events - checkout.session.completed"""
    import hmac, hashlib, json
    from flask import request, jsonify
    
    payload = request.get_data()
    sig_header = request.headers.get("Stripe-Signature", "")
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    
    # Verify signature
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        return jsonify({"error": "Invalid signature"}), 400
    
    # Handle event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_email = session.get("customer_email") or session.get("customer_details", {}).get("email")
        plan = session.get("metadata", {}).get("plan") or "starter"
        subscription_id = session.get("subscription")
        
        if user_email:
            # Update user in DB
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE users SET plan = ?, subscription_id = ?, stripe_status = 'active', updated_at = CURRENT_TIMESTAMP WHERE email = ?",
                (plan, subscription_id, user_email)
            )
            conn.commit()
            conn.close()
            print(f"✓ Updated {user_email} to plan {plan}")
    
    return jsonify({"status": "success"}), 200
