

from flask import Blueprint, render_template, request, redirect, url_for

from flask import current_app as app

from app import db

from app.models import User

from flask_login import current_user, login_user, logout_user

login_blueprint = Blueprint('login_blueprint', __name__)   


from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SubmitField
from wtforms.validators import DataRequired

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Remember Me')
    submit = SubmitField('Sign In')



@login_blueprint.route('/login/', methods=['GET','POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main_blueprint.homepage'))

    form = LoginForm()

    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user is None or not user.check_password(form.password.data):
            print('Invalid username or password')
            return redirect(url_for('login_blueprint.login'))
        login_user(user, remember=form.remember_me.data)
        return redirect(url_for('main_blueprint.homepage'))

    return render_template('login.html', form=form)


@login_blueprint.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login_blueprint.login'))