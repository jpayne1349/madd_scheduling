
from flask import Flask
from flask_migrate import Migrate
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
migrate = Migrate()

login_manager = LoginManager()

def create_app():
    
    """Initialize the core application."""
    app = Flask(__name__, instance_relative_config=False)

    app.config.from_object('config.DevelopmentConfig') # grabbing the development config class out of config.py
    # our config file will be located elsewhere

    db.init_app(app)
    migrate.init_app(app, db)
    print('')
    print('')
    print('************** SERVER IS LIVE *****************')
    print('')
    print('******* Access at http://localhost:5000 *******')
    print('')
    print('****** Close Terminal or "Ctrl+c" to stop ******')
    print('')
    print('')

    login_manager.init_app(app)

    login_manager.login_view = 'login_blueprint.login'
    login_manager.login_message = None

    # this is voodoo magic...
    # all 'pieces' of the app must be brought in inside this context function
    # this is supplying the already created app with the resources inside the app folder
    with app.app_context():

        from .main_blueprint import main # giving the app access to this folder and this file
        from .login_blueprint import login

        app.register_blueprint(main.main_blueprint)  # registering the blueprint inside that file
        app.register_blueprint(login.login_blueprint)
        
        from . import models  # the period means this directory, import those two modules

        return app


