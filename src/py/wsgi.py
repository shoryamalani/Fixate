from server import *

if __name__ == "__main__":
    server = Flask(__name__)#,template_folder="./dist/app/templates"
    server.config['SECRET_KEY'] = 'secret!'
    server.run()
