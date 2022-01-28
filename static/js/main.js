Vue.component('item', {
    
    props: {
        item: Object,
    },
    template:  `<div class="row" style="padding: 1px 0;" v-if="item.display && checkParentDisplay(item.item_id)">

                    <div class="col col-sm-auto idcol"><b>{{item.arrindex}}</b></div>

                    <div class="col col-sm-auto container" v-if="item.depth > 1" >
                        <div class="row">
                            <div v-for="index in (item.depth-1)" class="child-left-padding col-sm-auto"></div>
                        </div>
                    </div>

                    <div v-bind:class="item.showIndentArrow ? 'col-sm-auto visible' : 'col-sm-auto invisible'">
                        <button class="btn btn-sm UIbtn" v-on:click="toggleDisplayChildren(item.item_id)">
                            <i v-bind:class="item.displayChildren ? 'bi bi-caret-down-fill' : 'bi bi-caret-right-fill'"  width="10"></i>
                        </button>
                    </div>


                    <div v-if="item.completed" class="col">
                        <strike class="grayedText"><div v-html="item.mainText"></div></strike>
                    </div>

                    <div class="col" v-else>
                        <div v-html="item.mainText"></div>
                    </div>

                    <div class="col-sm-auto px-1" v-bind:class="item.type==='TODO' ? 'visible' : 'invisible'"><span v-bind:class="item.completed ? 'completedText' : 'warningText'">{{item.dueDate}}</span></div>
                    
                    <div class="col-sm-auto px-1" v-bind:class="item.type==='TODO' ? 'visible' : 'invisible'">
                        <button class="btn btn-sm btn-outline-secondary UIbtn" v-on:click="toggleComplete(item.item_id)">
                            <i class="bi bi-check-lg" v-bind:class="item.completed ? 'visible' : 'invisible'"  width="10"></i>
                        </button>
                    </div>

                    <div class="col-sm-auto px-1" v-bind:class="item.type==='TODO' ? 'visible' : 'invisible'">
                        <button class="btn btn-sm btn-outline-secondary UIbtn" v-bind:class="item.priorityLevel > 2 ? '' : 'warningButton'" v-on:click="incPriority(item.item_id)">
                            <b class="text-center">{{item.priorityLevel}}</b>
                        </button>
                    </div>
                    
                    <div class="col-sm-auto btn-group align-items-start px-1" style="" role="group" aria-label="moveitem">
                        <button class="btn btn-sm btn-outline-secondary arrowButtons UIbtn" v-on:click="moveItem(item.item_id, 'left')"><i class="bi bi-arrow-left-short" width="10"></i></button>  
                        <button class="btn btn-sm btn-outline-secondary arrowButtons UIbtn" v-on:click="moveItem(item.item_id, 'up')"><i class="bi bi-arrow-up-short" width="10"></i></button>  
                        <button class="btn btn-sm btn-outline-secondary arrowButtons UIbtn" v-on:click="moveItem(item.item_id, 'down')"><i class="bi bi-arrow-down-short" width="10"></i></button>  
                        <button class="btn btn-sm btn-outline-secondary arrowButtons UIbtn" v-on:click="moveItem(item.item_id, 'right')"><i class="bi bi-arrow-right-short" width="10"></i></button>    
                    </div>
                    
                    <div class="col-sm-auto px-1">
                        <button class="btn btn-sm btn-outline-secondary UIbtn" v-on:click="deleteThisItem(item.item_id)"><i class="bi bi-trash" width="10"></i></button>    
                    </div>

                    <div class="col-sm-auto px-1">
                        <button class="btn btn-sm btn-outline-secondary UIbtn" v-on:click="editItem(item.item_id)"><i class="bi bi-pencil" width="10"></i></button>    
                    </div>
                </div>`,
    methods : {
        deleteThisItem : function (id) {
            if (confirm("Are you sure you want to delete this item? All children under this item will also be deleted. The item can only be recovered from a previous save")) {
                app.deleteItem(id)
            }
        },

        toggleDisplayChildren : function (id) {
            app.toggleDisplayChildren(id)
        },

        toggleComplete : function (id) {
            app.toggleComplete(id)
        },

        getIndex: function (id) {
            return app.findIndex(id)
        },

        moveItem : function (id, dir) {
            app.moveItem(id, dir)
        },

        incPriority: function (id) {
            app.incPriority(id)
        },

        checkParentDisplay: function (id) {
            const res = app.checkParentDisplay(id)
            return res
        },

        editItem: function (id) {
            app.$data.editingID = id
            //app.populateAddField(id)
            app.toggleAddFieldVisibility(true)
        }
    }
});

var app = new Vue({
    delimiters: ['[[', ']]'],
    el: '#vue-app',
    data: {
        items:{
            Base : [],
        },
        totalItems:0,
        lastID:0,
        debug:true,
        pellContent:"",
        selectedFolder:"Base",
        lastSaved:"",
        filter:{
            type: "0",
            date: "0",
            priority: "0",
            completion: "0"
        },
        editingID: -1
    },

    mounted : function (){
        window.setInterval(() => {
            this.saveState()
          }, 900000)
    },

    methods : {

        populateAddField: function (id) {
            if (id === -1) {
                document.getElementById('dueDateSelect').value = getCurDate();
                this.resetPell();
            } else {

                document.getElementById("typeSelect").value = this.getVal(id, "type")
                document.getElementById("dueDateSelect").value = this.getVal(id, "dueDate") 
                this.pellContent = this.getVal(id, "mainText")
            }
        },

        toggleAddNew: function () {

            this.editingID = -1
            //this.populateAddField(-1)
            this.toggleAddFieldVisibility(false)
        },

        toggleAddFieldVisibility: function(ensureOpen) {

            document.getElementById("addFieldButton").classList.toggle("bi-plus-lg")
            document.getElementById("addFieldButton").classList.toggle("bi-x-lg")
            document.getElementById("editBoxWrapper").classList.toggle("invisible")
            document.getElementById("mainContainer").classList.toggle("pt-xxl")

            if (ensureOpen && document.getElementById("editBoxWrapper").classList.contains("invisible")) {
                this.toggleAddFieldVisibility(false)
            }

            //console.log(this.editingID)
        },

        deleteFolder: function () {
            
            console.log(Object.keys(this.items))

            if (Object.keys(this.items).length > 1) {
                if (confirm("Are you sure you want to delete this folder? All items in this folder will be lost")) {
                    delete this.items[this.selectedFolder]
                    this.selectedFolder = Object.keys(this.items)[0]
                }
            } else {
                console.log("Cant delete only folder")
            }

            this.refresh()
            
        },

        submitNewFolderName: function() {
            const input = document.getElementById("edit-folder-input").value
            console.log(input)
            
            if (!this.items[input]) {
                this.items[input] = this.items[this.selectedFolder]
                delete this.items[this.selectedFolder]
                this.selectedFolder = input

                let editfield = document.getElementById("edit-folder-name")
                editfield.classList.remove("visible")
                editfield.classList.add("invisible")
            } else {
                alert(`Folder already exists: ${input}`)
            }

            this.refresh()
        },

        editFolderName: function () {
            let editfield = document.getElementById("edit-folder-name")
            editfield.classList.remove("invisible")
            editfield.classList.add("visible")

        },

        addFolder: function () {
            let basestring = "Base"
            while (this.items[basestring]) {
                basestring += "-new"
            }

            this.items[basestring] = []
            this.refresh()
        },

        changeActiveFolder: function (key) {
            if (this.items[key]) {
                this.selectedFolder = key
            }
            this.refresh()
        },

        updateFilterVals: function () {
            this.filter = {
                type: document.getElementById("item-type-filter").value,
                date: document.getElementById("item-date-filter").value,
                priority: document.getElementById("item-priority-filter").value,
                completion: document.getElementById("item-finish-filter").value
            }
        },

        refresh: function () {

            this.updateFilterVals()

            //console.log(Object.keys(this.items))
            Object.keys(this.items).forEach(key => {
                if (this.items[key].length > 0 && key === this.selectedFolder) {
                    this.items[key].forEach((item, index) => {
                        //console.log(item)
                        if (this.getDescendants(item.item_id).length > 0) {
                            item.showIndentArrow = true;
                        } else {
                            item.showIndentArrow = false;
                        }
        
                        item.arrindex = index;
                    });
                }
            });

            Object.keys(this.items).forEach(key => {
                if (this.items[key].length > 0 && key === this.selectedFolder) {
                    this.items[key].forEach((item, index) => {

                        item.display = this.checkAgainstFilter(item)

                        if (!item.display) {}//console.log(`${item.item_id} filtered`)}
                        else {
                            let parent_id = this.getParent(item.item_id)
                            while (parent_id !== -1) {
                                this.setVal(parent_id, 'display', true)
                                //console.log(`flipped ${parent_id} to true because its descendant needs to be displayed`)
                                parent_id = this.getParent(parent_id)
                            }
                        }

                    });
                }
            });

            this.$forceUpdate
        },

        checkAgainstFilter: function(item) {
            
            switch (this.filter.type) {
                case "1":
                    if (item.type === "NOTE") return false
            }

            if (item.type === "TODO" ) {
                switch (this.filter.completion) {
                    case "1":
                        if (item.completed) return false
                }
                
                const plevel = parseInt(this.filter.priority)
                //console.log(plevel)
                if ( item.priorityLevel > plevel && plevel !== 0) return false




                const days = parseInt(this.filter.date)
                if (days !== -1 && daysUntilDate(item.dueDate) > days) return false

            }

            return true
        },

        checkParentDisplay: function(id) {

            const parent_id = this.getParent(id)
            if (parent_id === -1) return true
            if (!this.getVal(parent_id, 'displayChildren')) return false
            return this.checkParentDisplay(parent_id)
        },

        getParent: function(id) {
            const depth = this.getVal(id, 'depth')
            if (depth === 0) return -1
            
            const index = this.findIndex(id)

            for (let i = index; i > 0; i--) {
                if (this.items[this.selectedFolder][i].depth === depth-1) return this.items[this.selectedFolder][i].item_id
            }

            return -1
        },

        resetData: function() {
            this.items={
                Base: []
            }
            this.totalItems=0
            this.lastID=0
            this.debug=true
            this.pellContent=""
            this.filter = {
                type: "0",
                date: "0",
                priority: "0",
                completion: "0"
            }
            this.editingID = -1
            //this.resetPell()
            
        },

        getAll: function (field) {
            let output = []
            this.items[this.selectedFolder].forEach(item => {
                output.push(item[field])
            });
            return output
        },

        toggleDisplayChildren: function (id) {

            const displayChildren = !this.getVal(id, "displayChildren")
            this.setVal(id, "displayChildren", displayChildren)

            //const descendants = this.getDescendants(id);
            //descendants.forEach(item => {
            //    this.setVal(item, "display", displayChildren)
            //});
        },

        toggleComplete: function (id) {

            const toggled = !this.getVal(id, "completed")
            this.setVal(id, "completed", toggled)

            const desc = this.getDescendants(id)
            desc.forEach(item => {
                this.setVal(item, "completed", toggled)
            });

            if (toggled) {
                playAudio('ding')
            }
        },

        getVal: function (id, field) {

            const index = this.findIndex(id)
            return this.items[this.selectedFolder][index][field]
        },

        setVal: function (id, field, val) {

            const index = this.findIndex(id)
            this.items[this.selectedFolder][index][field] = val
        },

        findIndex: function (id) {
            const index = this.items[this.selectedFolder].findIndex(object => {
                return object.item_id === id;
            });

            return index;
        },

        getDescendants: function (id) {
            let output = [];
            const index = this.findIndex(id)
            const startingDepth = this.items[this.selectedFolder][index].depth

            for (let i = index + 1; i < this.items[this.selectedFolder].length; i++) {
                if (this.items[this.selectedFolder][i].depth > startingDepth) {
                    output.push(this.items[this.selectedFolder][i].item_id)
                } else {
                    break;
                }
            }

            return output
        },

        displayStatus: function () {
            console.log(this.$data)
        },

        addItem: function (item, index) {

            this.items[this.selectedFolder].splice(index, 0, item)
            //this.items.push(item)

            this.totalItems++;
            this.lastID++;

            this.refresh();
        },


        deleteItem: function (id) {
            
            const index = this.findIndex(id)
            
            let starting_depth = this.items[this.selectedFolder][index].depth

            if (index > -1) {
                do {
                    this.items[this.selectedFolder].splice(index, 1)
                    this.totalItems--;
                    
                } while (this.items[this.selectedFolder][index] && this.items[this.selectedFolder][index].depth > starting_depth)
            }
            
        },

        moveItem: function (id, dir) {
            const index = this.findIndex(id)
            const depth = this.getVal(id, 'depth')

            switch (dir) {
                case "left":
                    if (depth > 1) {
                        this.items[this.selectedFolder][index].depth--;
                    }
                    break;
                case "right":
                    if (index > 0 && (this.items[this.selectedFolder][index - 1].depth === depth || this.items[this.selectedFolder][index - 1].depth-1 === depth)) {
                        this.items[this.selectedFolder][index].depth++;
                    } 
                    break;
                case "up":
                    if (index > 0) {
                        if (this.items[this.selectedFolder][index - 1].depth === depth) {
                            this.swap(index, index-1)
                        } else if (this.items[this.selectedFolder][index - 1].depth === depth - 1) {
                            this.items[this.selectedFolder][index].depth--;
                            this.swap(index, index-1)
                        }
                    }
                    break;
                case "down":
                    if (index < this.totalItems-1) {
                        if (this.items[this.selectedFolder][index + 1].depth === depth) {
                            this.swap(index, index+1)
                        } else if (this.items[this.selectedFolder][index + 1].depth === depth - 1) {
                            this.items[this.selectedFolder][index+1].depth--;
                            this.swap(index, index+1)
                        }
                    }
                    break;
                default:
                    console.log(err)
            }


            this.refresh();
        },

        swap: function (a, b) {
            var temp = this.items[this.selectedFolder][a]
            this.items[this.selectedFolder][a] = this.items[this.selectedFolder][b]
            this.items[this.selectedFolder][b] = temp;
        },

        saveState: async function () {

            const jsonData = JSON.stringify(this.$data)

            try {
                const response = await fetch(`/api/saveload/save/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: jsonData
                })        
            } catch(e) {
                console.log(e);
            }

            this.lastSaved = getCurTime()

        },

        loadState: async function () {
            try {
                const resp = await fetch(`/api/saveload/load/`)
                const body = await resp.json()
                
                for (let item in body) {
                    this[item] = body[item]
                }
            } catch(e) {
                console.log(e)
            }
        },

        resetPell: function () {
            var editor = document.getElementsByClassName("pell-content")[0];
            editor.innerHTML = "";
            this.pellContent = "";
        },

        incPriority: function (id) {
            let p = this.getVal(id, 'priorityLevel')
            if (p === 5) {
                p = 1
            } else {
                p++
            }
            this.setVal(id, 'priorityLevel', p)
        },

        submitNewItem: function () {

            if (this.pellContent === "" || this.pellContent === "<div></div>") {
                alert("Cannot submit an empty item!")
            } else if (this.editingID === -1) {

                let item = this.defaultItem();

                item.mainText = this.pellContent
                item.type = document.getElementById("typeSelect").value
                item.dueDate = document.getElementById("dueDateSelect").value

                if (item.dueDate === "") {item.dueDate = getCurDate()}

                const rel = document.getElementById("relationToEl").value
                
                const idstring = document.getElementById("elSelected").value
                
                const posindex = parseInt(idstring.substring(0, idstring.indexOf(':')))

                const index = this.getIndexOfRelPos(rel, posindex)
                
                item.depth = index['depth']
                this.addItem(item, index['index'])

                
            } else {
                
                this.setVal(this.editingID, "type", document.getElementById("typeSelect").value)
                this.setVal(this.editingID, "dueDate", document.getElementById("dueDateSelect").value)
                this.setVal(this.editingID, "mainText", this.pellContent)
            }

            this.resetPell()
        },

        defaultItem: function () {
            let item = {};
            item.createDate = getCurDate()
            item.item_id = String(this.lastID);
            item.depth = 1;
            item.showIndentArrow = false;
            item.display = true;
            item.displayChildren = true;
            item.completed = false;
            item.arrindex = 0;
            item.priorityLevel = 5;
            
            return item
        },

        getAllActiveItemNames: function () {

            let ids = this.getAll("arrindex")
            let names = this.getAll("mainText")

            let output = []

            for (let i = 0; i < this.items[this.selectedFolder].length; i++) {
                output.push(String(ids[i]) + ": " + String(names[i]))
            }

            return output
        },

        getIndexOfNextSibling: function (id) {

            let sib_index = this.findIndex(id)
            let sib_depth = this.getVal(id, "depth")

            for (let i = sib_index + 1; i < this.items[this.selectedFolder].length; i ++) {
                //console.log(String(this.items[i].depth) + " " + String(sib_depth))
                if (this.items[this.selectedFolder][i].depth <= sib_depth) {
                    //console.log("found next sibling at " + String(i))
                    return i
                }
            }

            console.log("cannot find next sibling")
            return -1

        },

        getIndexOfRelPos: function (relation, posindex) {


            let id = posindex > -1 ? this.items[this.selectedFolder][posindex].item_id : "ROOT"

            let output = {
                index: this.items[this.selectedFolder].length,
                depth: 1
            }

            if (id === "ROOT"){ 
                if (relation === "FIRST-CHILD") {
                    output.index = 0
                }
            } else {
                switch (relation) {
                    case 'FIRST-CHILD':
                        output.depth = this.getVal(id, 'depth') + 1
                        output.index = this.findIndex(id) + 1
                        break;
                    case 'LAST-CHILD':
                        output.depth = this.getVal(id, 'depth') + 1
                        let sib_index = this.getIndexOfNextSibling(id)
                        output.index = sib_index === -1 ? this.items[this.selectedFolder].length : sib_index
                        break;
                    case 'PREV-SIBLING':
                        output.depth = this.getVal(id, 'depth')
                        output.index = this.findIndex(id)
                        break;
                    case 'NEXT-SIBLING':
                        output.depth = this.getVal(id, 'depth')
                        let s_index = this.getIndexOfNextSibling(id)
                        output.index = s_index === -1 ? this.items[this.selectedFolder].length : s_index
                        break;
                }
            }

            return output
        },


        changeFieldNameForItems: function (oldName, newName) {
            for (const [key, folderarr] of Object.entries(this.items)) {
                folderarr.forEach(item => {
                    item[newName] = item[oldName]
                    delete item[oldName]
                })
            }
        },

        backlogValsIfEmpty: function (fieldName, val) {
            for (const [key, folderarr] of Object.entries(this.items)) {
                folderarr.forEach(item => {
                    if (item[fieldName] === undefined) {
                        item[fieldName] = val
                    }
                })
            }
        },


        logbutton: function () {
            this.backlogValsIfEmpty('priorityLevel', 5)

            this.refresh()
        }
    },

    created : function () {
        //this.resetData();
        this.loadState();

        this.refresh();

        
    }

});


const pell = window.pell;
const editor = document.getElementById("editor");

pell.init({
  element: editor,
  onChange: (html) => {
    app.$data.pellContent = html;
  }
})


function getCurDate() {
    return new Date().toISOString().split('T')[0]
}

function getCurTime() {
    return new Date().toISOString()
}

function playAudio(id) {
    document.getElementById(id).play();
}


function daysUntilDate(due) {

    const a = new Date()
    const b = new Date(due.substring(0, 4), String(parseInt(due.substring(5, 7))-1), due.substring(8, 10))

    const res = Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));

    return res
}

