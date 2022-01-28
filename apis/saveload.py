from flask import request, abort, Blueprint, jsonify
import json
import ast
from datetime import datetime
import os
import glob
import pickle

filedir = "C:\\todo\\"
fileprefix = "notes-todo-"

saveload_api = Blueprint("saveload", __name__, url_prefix="/api/saveload")

@saveload_api.post('/save/')
def save_state():
    
    fullfilename = os.path.join(filedir, fileprefix + datetime.now().strftime("%Y-%m-%d-%H-%M")+".txt")
    picklename = os.path.join(filedir, fileprefix + datetime.now().strftime("%Y-%m-%d-%H-%M")+".pickle")

    with open(picklename, 'wb') as handle:
        pickle.dump(request.json, handle, protocol=pickle.HIGHEST_PROTOCOL)

    return "Done", 200


@saveload_api.get('/load/')
def load_state():

    list_of_files = glob.glob(filedir + "*.pickle") # * means all if need specific format then *.csv
    latest_file = max(list_of_files, key=os.path.getctime)

    with open(latest_file, 'rb') as handle:
        print("Loaded pickle file")
        return jsonify(pickle.load(handle))