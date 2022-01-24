from flask import request, abort, Blueprint, jsonify
import json
import ast
from datetime import datetime
import os
import glob

filedir = "C:\\todo\\"
fileprefix = "notes-todo-"

saveload_api = Blueprint("saveload", __name__, url_prefix="/api/saveload")

@saveload_api.post('/save/')
def save_state():
    
    fullfilename = os.path.join(filedir, fileprefix + datetime.now().strftime("%Y-%m-%d-%H-%M")+".txt")

    file1 = open(fullfilename,"w")
    file1.write(str(request.json))
    file1.close()

    return "Done", 200


@saveload_api.get('/load/')
def load_state():

    list_of_files = glob.glob(filedir + "*.txt") # * means all if need specific format then *.csv
    latest_file = max(list_of_files, key=os.path.getctime)

    file1 = open(latest_file,"r")
    saved_string = file1.readline()
    JSONdata = ast.literal_eval(saved_string)
    
    return jsonify(JSONdata) 