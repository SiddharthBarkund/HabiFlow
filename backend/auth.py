from flask import Blueprint, request, jsonify, session
from flask_login import login_user, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from .models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json(silent=True) or {}
    
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''
    first_name = (data.get('first_name') or '').strip()
    last_name = (data.get('last_name') or '').strip()
    q1 = data.get('q1') or ''
    a1 = (data.get('a1') or '').lower().strip()
    q2 = data.get('q2') or ''
    a2 = (data.get('a2') or '').lower().strip()
    email = (data.get('email') or '').strip()

    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password are required'})
    
    if not q1 or not a1 or not q2 or not a2:
        return jsonify({'success': False, 'message': 'Please answer all security questions'})

    if User.query.filter_by(username=username).first():
        return jsonify({'success': False, 'message': 'Username already exists'})

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    
    new_user = User(
        first_name=first_name,
        last_name=last_name,
        username=username,
        password=hashed_password,
        security_q1=q1,
        security_a1=a1,
        security_q2=q2,
        security_a2=a2,
        email=email
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'Account created! Please login.'})

@auth_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password are required'})

    user = User.query.filter_by(username=username).first()
    
    if user and check_password_hash(user.password, password):
        session.permanent = True  # Ensures the session lives for 30 days
        login_user(user, remember=True)
        
        full_name = f"{user.first_name} {user.last_name}".strip()
        return jsonify({
            'success': True, 
            'username': user.username, 
            'first_name': full_name,
            'email': user.email if user.email else ""
        })
    
    return jsonify({'success': False, 'message': 'Invalid username or password'})

@auth_bp.route('/api/check_session', methods=['GET'])
def check_session():
    if current_user.is_authenticated:
        full_name = f"{current_user.first_name} {current_user.last_name}".strip()
        return jsonify({
            'is_logged_in': True, 
            'username': current_user.username, 
            'first_name': full_name,
            'email': current_user.email if current_user.email else ""
        })
    return jsonify({'is_logged_in': False})

@auth_bp.route('/api/get_security_questions', methods=['POST'])
def get_security_questions():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    
    if not username:
        return jsonify({'success': False, 'message': 'Username is required'})

    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({
            'success': True, 
            'q1': user.security_q1,
            'q2': user.security_q2
        })
    return jsonify({'success': False, 'message': 'User not found'})

@auth_bp.route('/api/reset_password', methods=['POST'])
def reset_password():
    data = request.get_json(silent=True) or {}
    username = (data.get('username') or '').strip()
    a1 = (data.get('a1') or '').lower().strip()
    a2 = (data.get('a2') or '').lower().strip()
    new_password = data.get('new_password') or ''

    if not username or not new_password or not a1 or not a2:
        return jsonify({'success': False, 'message': 'All fields are required'})

    user = User.query.filter_by(username=username).first()
    
    if user:
        user_a1 = (user.security_a1 or '').lower().strip()
        user_a2 = (user.security_a2 or '').lower().strip()
        
        if user_a1 == a1 and user_a2 == a2:
            user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
            db.session.commit()
            return jsonify({'success': True, 'message': 'Password reset successful!'})
        
    return jsonify({'success': False, 'message': 'Incorrect security answers.'})

@auth_bp.route('/api/logout', methods=['GET', 'POST'])
def logout():
    if current_user.is_authenticated:
        logout_user()
    session.clear()
    return jsonify({'success': True})
