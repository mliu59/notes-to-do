from flask import Flask, render_template

app = Flask(__name__)


from apis.saveload import saveload_api
app.register_blueprint(saveload_api)

@app.route("/")
def main():
    return render_template("main.html")