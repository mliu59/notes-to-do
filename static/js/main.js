Vue.component('item', {
    
    props: {
        item: Object,
    },
    template:  `<div class="row" v-if="item.display">

                    <div class="col col-sm-auto container" v-if="item.depth > 1" >
                        <div class="row">
                            <div v-for="index in (item.depth-1)" class="child-left-padding col-sm-auto"></div>
                        </div>
                    </div>

                    <div v-bind:class="item.showIndentArrow ? 'col-sm-auto visible' : 'col-sm-auto invisible'" v-if="item.displayChildren">
                    <button class="btn btn-sm" v-on:click="toggleDisplayChildren(item.item_id)">
                        <i v-bind:class="item.displayChildren ? 'bi bi-caret-down-fill' : 'bi bi-caret-right-fill'"  width="10"></i>
                    </button>
                    </div>


                    <div v-if="item.completed" class="col">
                        <strike><div v-html="item.mainText"></div></strike>
                    </div>
                    <div class="col" v-else>
                        <div v-html="item.mainText"></div>
                    </div>

                    <div class="col-sm-auto">{{item.item_id}}</div>
                    <div class="col-sm-auto" v-if="item.type==='TODO'">
                        <button class="btn btn-sm btn-outline-secondary" v-on:click="toggleComplete(item.item_id)">
                            <i class="bi bi-check-lg" v-bind:class="item.completed ? 'visible' : 'invisible'"  width="10"></i>
                        </button>
                    </div>
                    <div class="col-sm-auto">
                        <button class="btn btn-sm btn-outline-secondary" v-on:click="deleteThisItem(item.item_id)"><i class="bi bi-trash" width="10"></i></button>    
                    </div>
                </div>`,
    methods : {
        deleteThisItem : function (id) {
            app.deleteItem(id)
        },

        toggleDisplayChildren : function (id) {
            app.toggleDisplayChildren(id)
        },

        toggleComplete : function (id) {
            app.toggleComplete(id)
        }
    }
})

var app = new Vue({
    delimiters: ['[[', ']]'],
    el: '#vue-app',
    data: {
        items:[],
        totalItems:0,
        lastID:0,
        debug:true,
    },

    watch: {
        items: function () {

            this.items.forEach(item => {
                if (this.getDescendants(item.item_id).length > 0) {
                    item.showIndentArrow = true;
                }
            });

            this.saveState()
        },
    },

    methods : {
        resetData: function() {
            this.items=[]
            this.totalItems=0
            this.lastID=0
            this.debug=true
        },


        toggleDisplayChildren: function (id) {

            const displayChildren = !this.getVal(id, "displayChildren")
            this.setVal(id, "displayChildren", displayChildren)

            const descendants = this.getDescendants(id);
            descendants.forEach(item => {
                this.setVal(item, "display", displayChildren)
            });
        },

        toggleComplete: function (id) {
            this.setVal(id, "completed", !this.getVal(id, "completed"))
        },

        getVal: function (id, field) {

            const index = this.findIndex(id)
            return this.items[index][field]
        },

        setVal: function (id, field, val) {

            const index = this.findIndex(id)
            this.items[index][field] = val
        },

        findIndex: function (id) {
            const index = this.items.findIndex(object => {
                return object.item_id === id;
            });

            return index;
        },

        getDescendants: function (id) {
            let output = [];
            const index = this.findIndex(id)
            const startingDepth = this.items[index].depth

            for (let i = index + 1; i < this.items.length; i++) {
                if (this.items[i].depth > startingDepth) {
                    output.push(this.items[i].item_id)
                } else {
                    break;
                }
            }

            return output
        },

        displayStatus: function () {
            console.log(this.getDescendants(this.items[0].item_id))
        },

        addItem: function (item) {

            item.item_id = this.lastID
            this.items.push(item)

            this.totalItems++;
            this.lastID++;
        },


        deleteItem: function (id) {
            
            const index = this.findIndex(id)
            
            let starting_depth = this.items[index].depth

            if (index > -1) {
                do {
                    this.items.splice(index, 1)
                    this.totalItems--;
                    
                } while (this.items[index] && this.items[index].depth > starting_depth)
            }
            
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

        },

        loadState: async function () {
            try {
                const resp = await fetch(`/api/saveload/load/`)
                const body = await resp.json()
                
                for (let item in body) {
                    this[item] = body[item]
                }
                //console.log(body)
            } catch(e) {
                console.log(e)
            }
        },
    },

    created : function () {
        this.resetData();
        //this.loadState();
    }

})


var input_app = new Vue({
    delimiters: ['[[', ']]'],
    el: '#input-app',
    data: {
        pellContent:""

    },
    methods : {
        submitNewItem: function () {
            let item = this.defaultItem();

            item.mainText = this.pellContent
            item.type = document.getElementById("typeSelect").value

            item.dueDate = document.getElementById("dueDateSelect").value

            app.addItem(item)
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
            
            return item
        },

    }
});

const pell = window.pell;
const editor = document.getElementById("editor");

pell.init({
  element: editor,
  onChange: (html) => {
    input_app.$data.pellContent = html;
  }
})

function getCurDate() {
    return new Date().toISOString().split('T')[0]
}

document.getElementById('dueDateSelect').value = getCurDate()