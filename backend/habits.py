from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
import json
from .models import db

habits_bp = Blueprint('habits', __name__)

@habits_bp.route('/api/save_data', methods=['POST'])
@login_required
def save_data():
    data = request.json
    current_user.habit_data = json.dumps(data)
    db.session.commit()
    return jsonify({'success': True})

@habits_bp.route('/api/get_data', methods=['GET'])
@login_required
def get_data():
    if not current_user.habit_data:
        return jsonify({})
    return jsonify(json.loads(current_user.habit_data))
