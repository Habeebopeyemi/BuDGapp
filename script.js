// for controlling budgetApp data structure
var budgetController = (function(){
        var Expense = function(id,description,Value){
        this.id = id
        this.description = description
        this.Value = Value
        }
        var Income = function(id,description,Value){
            this.id = id
            this.description = description
            this.Value = Value
        }
        var calculateTotal = function(type){
            var sum = 0
            data.allItems[type].forEach(function(cur){
                sum += cur.Value
            })
            data.totals[type] = sum
        }

        var data = {
            allItems:{
                inc:[],
                exp:[],
            },
            
            totals:{
                inc:0,
                exp:0,
            },
            budget: 0,
            percentage: -1,//to show that is not exixting for the first time

        }

        return {
            addItem: function(type, des, val){
            var newItem, ID
            // if we are gonna generate Id for each new input the each id has to be unique because of deletion,hence
            // since the first ID doesn't exist,we go by this
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1 
            } else{
                ID = 0
            }
            
            if(type === 'inc'){
                newItem = new Income(ID, des, val)
            }else if(type === 'exp'){
                newItem = new Expense(ID, des, val)
            }
            // pushing the new data into respective array
            data.allItems[type].push(newItem)

            // returning the new item
            return newItem
            
         },
         deleteItem: function(type,id){
             var ids, index
             ids = data.allItems[type].map(function(current){
                return current.id
             })
             index = ids.indexOf(id)

             if(index !== -1){
                data.allItems[type].splice(index, 1)
             }
         },
         calculateBudget: function(){
            // calculate total income and expenses
            calculateTotal('inc')
            calculateTotal('exp')
            // calculate budget: income - expense
            data.budget = data.totals.inc - data.totals.exp
            // calculate the percentage of income that we spent 
            data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100) 
         },
         getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
         },
        testing: function(){
            console.log(data)
        }
    }
})()

// for controlling the BudgetApp interface
var UIController = (function(){
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income__value',
        expensesLabel: '.budget__expenses__value',
        percentageLabel: '.budget__expenses__percentage',
        container: '.container'
    }
    return {
        getInput: function(){
           return {
                type: document.querySelector(DOMstrings.inputType).value,//this will either give us "inc" or "exp" 
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
        },
        addListItem: function(obj, type){
            var html, newHtml, element
            // create html string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="income__item__value">%value%</div><div class="item__delete"><button class="item__delete__btn"><i class="income__fas fas fa-times-circle" aria-hidden="true" ></i></button></div></div></div>'
            }else if(type === 'exp'){
                element = DOMstrings.expensesContainer

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete__btn"><i class="income__fas fas fa-times-circle" aria-hidden="true" ></i></button></div></div></div>'
            }
            
            // replacing the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', obj.Value)


            // insert the html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
         },
         deleteListItem: function(selectorID){
            var el
            el = document.getElementById(selectorID)
            el.parentNode.removeChild(el)
            
         },
         clearFields: function(){
             var fields, fieldArr
            // fiels actually return a list,hence we need to convert the list to an array
            // by passing it into slice function which is a method in the array object
             fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)
            // converting fields into Array
             fieldArr = Array.prototype.slice.call(fields)

            fieldArr.forEach(function(current, index, array){
                current.value = ""
            })
            fieldArr[0].focus()

         },
         displayBudget: function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp
            

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage+'%'
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---'
            }
         },
        getDOMstrings: function(){
            return DOMstrings
        }
    } 
})()

// for controlling event and interacting with both UI and data encapsulation(IIFE)
var controller = (function(budgetCtrl,UIctrl){

        var setUpEventListener = function(){
        var DOM = UIctrl.getDOMstrings()
        // handling click event of Add button
        document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem)
        // handling keyboard keypress in the DOM 
        document.addEventListener('keypress',function(event){
        if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem()
            }
        })
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
    }

    var updateBudget = function(){
        // 1. Calculate the budget
        budgetCtrl.calculateBudget()
        // 2. Return the budget
        var budget = budgetCtrl.getBudget()
        // 3. Display the budget on the UI
        UIctrl.displayBudget(budget)
    }

    // function to handle operation after event are confirmed
    var ctrlAddItem = function(){
        var input, newItem
        // 1. Get the field input data
        input = UIctrl.getInput()

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
             // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)
            // 3. Add the item to the UI
            UIctrl.addListItem(newItem, input.type)
            // clear fields
            UIctrl.clearFields()
            // calling the updateBudget function
            updateBudget()
        }   
    }

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id

        if(itemID){
            splitID = itemID.split('-')//inc-0 will split into ['inc','0'] the dash will be eliminated
            type = splitID[0]
            ID = parseInt(splitID[1])
            // delete the item from our data structure
            budgetCtrl.deleteItem(type, ID)
            // delete the item from the UI
            UIctrl.deleteListItem(itemID)
            // update and show the budget
            updateBudget()
        }
    }
    return {
      init: function(){
          console.log('The App has started')
          UIctrl.displayBudget(
           { budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1,
          })
          setUpEventListener()
      }
    }
    

  
})(budgetController,UIController)

// initialization function
controller.init()
