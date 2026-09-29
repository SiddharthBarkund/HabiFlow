import os
from datetime import timedelta
from flask import Flask, render_template, jsonify
from flask_login import LoginManager

from .models import db, User
from .auth import auth_bp
from .habits import habits_bp
from .profile import profile_bp

def create_app():
    # Resolve paths relative to project root
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    instance_path = os.path.join(project_root, 'instance')
    frontend_path = os.path.join(project_root, 'frontend')

    app = Flask(
        __name__,
        instance_path=instance_path,
        template_folder=frontend_path,
        static_folder=frontend_path,
        static_url_path=''
    )

    # Configuration
    app.config['SECRET_KEY'] = 'tuza_secret_key_ethe_ahe'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

    # Initialize extensions
    db.init_app(app)

    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify({'success': False, 'message': 'Authentication required'}), 401

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(habits_bp)
    app.register_blueprint(profile_bp)

    # Home route
    @app.route('/')
    def home():
        return render_template('index.html')

    return app

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
