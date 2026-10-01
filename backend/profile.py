from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from .models import db

profile_bp = Blueprint('profile', __name__)

@profile_bp.route('/api/change_password', methods=['POST'])
@login_required
def change_password():
    data = request.json
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if not check_password_hash(current_user.password, current_password):
        return jsonify({'success': False, 'message': 'Current password is incorrect'})

    current_user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
    db.session.commit()
    return jsonify({'success': True, 'message': 'Password changed successfully!'})

@profile_bp.route('/api/update_security_questions', methods=['POST'])
@login_required
def update_security_questions():
    data = request.json
    password = data.get('password')

    if not check_password_hash(current_user.password, password):
        return jsonify({'success': False, 'message': 'Incorrect password. Cannot update questions.'})

    current_user.security_q1 = data['q1']
    current_user.security_a1 = data['a1'].lower().strip()
    current_user.security_q2 = data['q2']
    current_user.security_a2 = data['a2'].lower().strip()
    
    db.session.commit()
    return jsonify({'success': True, 'message': 'Security questions updated successfully!'})

@profile_bp.route('/api/update_profile', methods=['POST'])
@login_required
def update_profile():
    data = request.json
    full_name = data.get('full_name', '')
    email = data.get('email', '')

    name_parts = full_name.strip().split(' ', 1)
    current_user.first_name = name_parts[0]
    if len(name_parts) > 1:
        current_user.last_name = name_parts[1]
    else:
        current_user.last_name = ''

    current_user.email = email
    db.session.commit()
    return jsonify({'success': True, 'message': 'Profile updated successfully!'})
