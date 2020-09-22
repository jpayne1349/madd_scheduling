
from . import db

# need to migrate and upgrade at each change


class Employee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(12), index=True)
    last_name = db.Column(db.String(12), index=True)
    username = db.Column(db.String(12), index=True)

    assignments = db.relationship('Assignment', backref='employee', lazy='dynamic')

    def __repr__(self):
        return f'Employee: {self.first_name} {self.last_name}'

class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    month = db.Column(db.Integer, index=True)
    day = db.Column(db.Integer, index=True)
    year = db.Column(db.Integer, index=True)
    classification = db.Column(db.String(10), index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('employee.id'))
    
    def __repr__(self):
        return f'{self.classification}: {self.month} {self.day} {self.year}  - User: {self.user_id}'

    