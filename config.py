

import os


basedir = os.path.abspath(os.path.dirname(__file__)) # using this package to find the location of this file, to be used later when locating the database file


class Config(object):
    DEBUG = False
    TESTING = False
    SECRET_KEY = "B\xb2?.\xdf\x9f\xa7m\xf8\x8a%,\xf7\xc4\xfa\x91"


    SESSION_COOKIE_SECURE = True

class ProductionConfig(Config):
    pass

class DevelopmentConfig(Config):
    DEBUG = True

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'app.db') # i guess this worked.

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    SESSION_COOKIE_SECURE = False

class TestingConfig(Config):

    TESTING = True


    SESSION_COOKIE_SECURE = False


"""

Should still read Chapter 3 of the book to get this configuration stuff down.

Should be using ENV type environment variables once the web server is started, instead of putting variables like SECRET KEY in the code.

Setting those variables can be done with "export FLASK_ENV=development" etc... from the command line. inside the environment


"""