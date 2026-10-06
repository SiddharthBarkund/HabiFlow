# HabiFlow - Root Entrypoint (routes forwarded to backend/)
from backend.app import app, db

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)