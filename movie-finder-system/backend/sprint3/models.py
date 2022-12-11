from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class UserModel(db.Model):
    __tablename__ = "usertable"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_name = db.Column(db.String(200), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)
    create_time = db.Column(db.DateTime, default=datetime.now)
    userimg = db.Column(db.String(1024), nullable=True)
    wishlist = db.Column(db.String(1024), nullable=True)
    banlist = db.Column(db.String(1024), nullable=True)
    followlist = db.Column(db.String(1024), nullable=True)
    follower= db.Column(db.String(1024), nullable=True)
    is_admin=db.Column(db.Integer)


class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False)
