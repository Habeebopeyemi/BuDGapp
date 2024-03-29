/*/////////////////////********creating budgetController module with IIFE and closure
this module contains the budget app data structure logics
*********/ ///////////////////////*/
const budgetController = (function () {
  const Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function () {
    return this.percentage;
  };

  const Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const calculateTotal = function (type) {
    data.totals[type] = data.allItems[type].reduce(
      (initial, current) => initial + current.value,
      0
    );
  };
  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
    expenseFullData: [],
  };

  return {
    getItem: function (type, des, val) {
      let newItem, ID;
      // generating id by selecting the id of the last element in either exp or inc array based on type and add 1 to it
      // checking if the data structure has element in it or not
      if (data.allItems[type].length === 0) {
        ID = 0;
      } else {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }

      // dynamic creation of income or expense instance based on type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      // dynamically adding item to the income or expense data structure base on type
      data.allItems[type].push(newItem);

      // returning the new item created
      return newItem;
    },
    calculateBudget: function () {
      // calculate total income and expenses
      calculateTotal("inc");
      calculateTotal("exp");
      // calculate the budget: income - expenses
      data.budget = data.totals["inc"] - data.totals["exp"];
      // calculate the percentage of income that we spent
      if (data.totals["inc" <= 0]) {
        data.percentage = -1;
      } else if (data.totals["inc"] > 0) {
        data.percentage = Math.round(
          (data.totals["exp"] / data.totals["inc"]) * 100
        );
      }
    },
    calculatePercentages: function () {
      data.allItems["exp"].forEach(el => {
        el.calcPercentage(data.totals["inc"]);
      });
    },
    getPercentages: function () {
      let allPercentages;
      allPercentages = data.allItems["exp"].map(el => {
        return el.getPercentage();
      });
      return allPercentages;
    },
    getBudget: function () {
      return {
        budget: data.budget,
        percentage: data.percentage,
        totalInc: data.totals["inc"],
        totalExp: data.totals["exp"],
      };
    },
    deleteItem: function (type, ID) {
      let indexToDelete, updatedData;
      data.allItems[type].forEach((item, itemIndex) => {
        if (item.id === ID) {
          indexToDelete = itemIndex;
          return;
        }
      });

      updatedData = data.allItems[type]
        .slice(0, indexToDelete)
        .concat(data.allItems[type].slice(indexToDelete + 1));

      data.allItems[type] = updatedData;
    },
    unitTest: function () {
      console.log(data);
    },
  };
})();

/*/////////////////////********creating UIController module with IIFE and closure
this module contains the rendering or user interface interaction related
*********/ ///////////////////////*/
const UIController = (function () {
  const DOMSTRINGS = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeList: ".income__list",
    expensesList: ".expenses__list",
    incomePlaceHolder: ".budget__income__value",
    expensePlaceHolder: ".budget__expenses__value",
    percentagePlaceHolder: ".budget__expenses__percentage",
    budgetPlaceHolder: ".budget__value",
    container: ".container",
    percentageLabel: ".item__percentage",
    dateLabel: ".budget__title__month",
    inputIcon: ".add__fas",
  };
  let intArr;
  let intList = [];

  function generateDecimalPlace(num) {
    let numArr = [];
    numArr = Math.abs(num).toFixed(2).split(".");
    intArr = [...numArr];
    return intArr;
  }

  function generateFormat(int, dec, type) {
    let thousand;
    if (int.length <= 3) {
      return (
        (type === "exp" ? "-" : "+") +
        " " +
        int +
        "," +
        intList.join(",") +
        "." +
        dec
      );
    }
    int = int.substr(int.length - 3) + "." + int.substr(0, int.length - 3);
    int = int.split(".");
    thousand = int[0];
    intList.unshift(thousand);
    int = int[1];
    return generateFormat(int, dec, type);
  }
  function emptyIntList() {
    intList = [];
  }
  const formatNumber = function (num, type) {
    let result = generateDecimalPlace(num);
    let format = generateFormat(result[0], result[1], type);
    emptyIntList();
    return format;
  };
  let nodeListForEach = function (list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };
  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMSTRINGS.inputType).value,
        description: document.querySelector(DOMSTRINGS.inputDescription).value,
        value: parseFloat(document.querySelector(DOMSTRINGS.inputValue).value),
      };
    },
    getDOMStrings: function () {
      return DOMSTRINGS;
    },
    addListItem: function (obj, type) {
      let htmlMarkUp, element;

      // create HTML string literal and insert appropriate data
      if (type === "inc") {
        element = DOMSTRINGS.incomeList;
        let value = formatNumber(obj.value, type);
        htmlMarkUp = `<div class="item clearfix" id="inc-${obj.id}">
                        <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                            <div class="income__item__value">${value}</div>
                            <div class="item__delete">
                                <button class="item__delete__btn"><i class="income__fas fas fa-times-circle" aria-hidden="true" ></i></button>
                            </div>
                        </div>
                    </div>`;
      } else if (type === "exp") {
        element = DOMSTRINGS.expensesList;
        let value = formatNumber(obj.value, type);
        htmlMarkUp = `<div class="item clearfix" id="exp-${obj.id}">
                        <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                            <div class="item__value">${value}</div>
                            <div class="item__percentage">21%</div>
                            <div class="item__delete">
                                <button class="item__delete__btn"><i class="income__fas fas fa-times-circle" aria-hidden="true" ></i></button>
                            </div>
                        </div>
                    </div>`;
      } else {
        return;
      }
      // insert the mark up into the UI
      document
        .querySelector(element)
        .insertAdjacentHTML("beforeend", htmlMarkUp);
    },
    deleteListItem: function (selectedID) {
      let elementToDelete;
      elementToDelete = document.getElementById(selectedID);
      // removing the item from the DOM
      elementToDelete.parentNode.removeChild(elementToDelete);
    },
    clearInputFields: function () {
      let fields, fieldArr;

      // returns a nodeList
      fields = document.querySelectorAll(
        `${DOMSTRINGS.inputDescription}, ${DOMSTRINGS.inputValue}`
      );

      // borrowing array method to apply on the returned nodeList, to give it array features
      fieldArr = Array.prototype.slice.call(fields);

      // forEach is built into nodeList object prototype, hence safer to use it...
      fieldArr.forEach(element => {
        element.value = "";
      });

      // set focus on input
      fields[0].focus();
    },
    displayMonth: function () {
      let now, day, month, months, year;
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      now = new Date();
      day = now.getDay();
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMSTRINGS.dateLabel).textContent =
        day + " " + months[month] + ", " + year;
    },
    displayBudget: function (obj) {
      let type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMSTRINGS.budgetPlaceHolder).textContent =
        formatNumber(obj.budget, type);
      document.querySelector(DOMSTRINGS.incomePlaceHolder).textContent =
        formatNumber(obj.totalInc, "inc");

      document.querySelector(DOMSTRINGS.expensePlaceHolder).textContent =
        formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMSTRINGS.percentagePlaceHolder).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMSTRINGS.percentagePlaceHolder).textContent =
          "---";
      }
    },
    displayPercentage: function (percentages) {
      let percentageFields = document.querySelectorAll(
        DOMSTRINGS.percentageLabel
      );

      nodeListForEach(percentageFields, (item, index) => {
        if (percentages[index] > 0) {
          item.textContent = percentages[index] + "%";
        } else {
          item.textContent = "---";
        }
      });
    },
    changeType: function () {
      let fields = document.querySelectorAll(
        `${DOMSTRINGS.inputType}, ${DOMSTRINGS.inputDescription}, ${DOMSTRINGS.inputValue}`
      );

      nodeListForEach(fields, current => {
        current.classList.toggle("red-focus");
      });

      document.querySelector(DOMSTRINGS.inputIcon).classList.toggle("red");
    },
  };
})();

/*/////////////////////********creating Controller module with IIFE and closure
this module is the bridge that knows about the existence of the other two modules*********/ ///////////////////////*/
const controller = (function (budgetCtrl, UICtrl) {
  const setupEventListener = function () {
    let DOMstrings = UICtrl.getDOMStrings();
    document
      .querySelector(DOMstrings.inputBtn)
      .addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (e) {
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOMstrings.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOMstrings.inputType)
      .addEventListener("change", UICtrl.changeType);
  };
  const updateBudget = function () {
    // Calculate the budget
    budgetCtrl.calculateBudget();
    // return the budget
    let budget = budgetCtrl.getBudget();
    // Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  const updatePercentage = function () {
    let percentages;
    // calculate percentages
    budgetCtrl.calculatePercentages();
    // read percentages from the budget controller
    percentages = budgetCtrl.getPercentages();
    // update the UI with the new percentages
    UICtrl.displayPercentage(percentages);
  };
  const ctrlDeleteItem = function (event) {
    let itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      // delete the item from the user interface
      UICtrl.deleteListItem(itemID);
      // update and show the new budget
      updateBudget();
      // update the percentage
      updatePercentage();
    }
  };
  const ctrlAddItem = function () {
    let input, newItem;
    // Get the field input data
    input = UICtrl.getInput();

    // checking for impure input
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // Add the item to the budget controller
      newItem = budgetCtrl.getItem(input.type, input.description, input.value);
      // Add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      // clearing input fields
      UICtrl.clearInputFields();
      // Calculate and update the budget in the UI
      updateBudget();
      // update the percentage
      updatePercentage();
    }
  };
  return {
    init: function () {
      UICtrl.displayBudget({
        budget: 0,
        percentage: -1,
        totalInc: 0,
        totalExp: 0,
      });
      setupEventListener();
      UICtrl.displayMonth();
    },
  };
})(budgetController, UIController);

controller.init();
/*
let intArr
let intList = []
function generateDecimalPlace(num) {
  let numArr, integer, decimal;
  numArr = Math.abs(num).toFixed(2).split(".");
  intArr = [...numArr];
  return intArr;
};

let result = generateDecimalPlace(10000.10);

function generateFormat(int, dec, type) {
  let thousand;
  if (int.length <= 3) {
    return (type === "exp" ? "-" : "+") + " " + int + ',' + intList.join(",")+'.'+ dec;
  }
  int = int.substr(int.length - 3) + "." + int.substr(0, int.length - 3);
  int = int.split(".");
  thousand = int[0]
  intList.unshift(thousand);
  int = int[1];
  
  return generateFormat(int, dec, type);
}
console.log(generateFormat(result[0],result[1], 'inc'));
*/
