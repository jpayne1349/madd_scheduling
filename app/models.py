
from . import db

from flask_login import UserMixin

from werkzeug.security import generate_password_hash, check_password_hash

from app import login_manager
# need to migrate and upgrade at each change

@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True)
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    employees = db.relationship('Employee', backref='user', lazy='dynamic')
    assignments = db.relationship('Assignment', backref='user', lazy='dynamic')
    
    def __repr__(self):
        return '<User {}>'.format(self.username) 

class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(12), index=True)
    last_name = db.Column(db.String(12), index=True)
    username = db.Column(db.String(12), index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    assignments = db.relationship('Assignment', backref='employee', lazy='dynamic')

    def __repr__(self):
        return f'Employee: {self.first_name} {self.last_name}, User: {self.user_id}'

class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    month = db.Column(db.Integer, index=True)
    day = db.Column(db.Integer, index=True)
    year = db.Column(db.Integer, index=True)
    classification = db.Column(db.String(10), index=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employee.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    def __repr__(self):
        return f'{self.classification}: {self.month} {self.day} {self.year} Employee: {self.employee_id} , User: {self.user_id}'

    