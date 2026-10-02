from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100))  
    password = db.Column(db.String(255), nullable=False)
    
    # Security Questions
    security_q1 = db.Column(db.String(200))
    security_a1 = db.Column(db.String(200))
    security_q2 = db.Column(db.String(200))
    security_a2 = db.Column(db.String(200))
    
    # User Data (Storing JSON blob for habits)
    habit_data = db.Column(db.Text, default="{}")
