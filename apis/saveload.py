from flask import request, abort, Blueprint, jsonify
import json
import ast

savefilename = "notes-todo.txt"

saveload_api = Blueprint("saveload", __name__, url_prefix="/api/saveload")

@saveload_api.post('/save/')
def save_state():
    #print(str(request.json))
    file1 = open(savefilename,"w")
    file1.write(str(request.json))
    file1.close()

    return "Done", 200


@saveload_api.get('/load/')
def load_state():
    file1 = open(savefilename,"r")
    saved_string = file1.readline()
    JSONdata = ast.literal_eval(saved_string)
    #print(JSONdata['items'])
    
    return jsonify(JSONdata) 