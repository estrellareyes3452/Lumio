from flask import Flask, flash, render_template, request, redirect, url_for, flash
from models.entities.User import User 
from flask_mysqldb import MySQL
from flask_login import LoginManager , login_user, login_required, current_user
from config import config
from werkzeug.security import generate_password_hash
from models import ModelUser

lumioApp = Flask(__name__)
lumioApp.config.from_object(config['Development'])
db = MySQL(lumioApp)
adminUsuario = LoginManager(lumioApp)

@adminUsuario.user_loader
def agregarUsuario(id):
    return ModelUser.get_by_id(db, id)


@lumioApp.route("/")
def home():
    return render_template('/home.html')

@lumioApp.route('/signup', methods=['GET', 'POST'])
def signup():
        if request.method == 'POST':
            nombre = request.form['nombre']
            correo = request.form['correo']
            clave = request.form['clave']
            claveCifrada = generate_password_hash(clave)
            regUsuario = db.connection.cursor()
            regUsuario.execute("INSERT INTO usuario (nombre, correo, clave) VALUES (%s,%s,%s)", (nombre, correo, claveCifrada))
            db.connection.commit()
            regUsuario.close()
            return redirect(url_for('home'))
            
        
            return render_template('home.html')
        else :
            return render_template('home.html')

@lumioApp.route('/signin', methods=['GET', 'POST'])
def signin():
    if request.method == 'POST':
        usuario = User(request.form['nombre'], request.form['correo'], request.form['clave'], None)
        usuarioAutenticado = ModelUser.signin(db, usuario)
        if usuarioAutenticado is not None:
            login_user(usuarioAutenticado)
            if usuarioAutenticado.clave:
                if usuarioAutenticado.perfil == 'A':
                    return render_template('admin.html')
                else:
                    return render_template('home.html')
            else:
                flash('Contraseña incorrecta')
                return redirect(url_for('home'))
        else:
            flash('Usuario inexistente')
            return redirect(url_for('home'))
    else:
        return render_template('home.html')


@LumioApp.route('/signout',methods=['GET'´, 'POST'])
def signout ():
    logout_user()
    return redirect(url_for('home'))

@LumioApp.route('/home_admin',methods=['GET', 'POST'])
def home_admin():
    return render_template('admi.html')

@LumioApp.route('/sUsuario',methods=['GET', 'POST'])
def sUsuario():
    return render_template('user.html')








if __name__ == "__main__":
    lumioApp.run(port=5500, debug=True)