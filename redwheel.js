var RedWheel = function() {
  function Redwheel(options) {
    var model = new WheelModel(options),
        view = new WheelView({model: model, el: options.el});
    //TouchDaemon.start({cb: view.onUserClick, el: view.root});
    return view.render().attachHandlers();
  }
  return Redwheel;
}();

var WheelModel = function() {
  function WheelModel(options) {
    this.observers = [];
    this.array = options.array;
    this.selected = options.selected;
  }
  return WheelModel;
}();

WheelModel.prototype.toJSON = function() {
  return {array: this.array, selected: this.selected};
}

WheelModel.prototype.setPrevious = function() {
  var indexOf = this.array.indexOf(this.selected); 
  this.setSelected(indexOf > 0 ? this.array[indexOf - 1] : this.selected); 
}

WheelModel.prototype.setNext = function() {
  var indexOf = this.array.indexOf(this.selected); 
  this.setSelected(indexOf < this.array.length - 1 ? this.array[indexOf + 1] : this.selected); 
}

WheelModel.prototype.setSelected = function(value) {
  this.selected = value;  
  this.publish(value);
}

WheelModel.prototype.onChange = function(cb) {
  this.observers.push(cb);  
}

WheelModel.prototype.publish = function(value) {
  this.observers.forEach(function(cb) {cb(value)});  
}

var WheelView = function() {
  function WheelView(options) {
    this.model = options.model;
    this.el = options.el || 'body';
    this.root = 'redwheel-wrapper' + Utils.randomId();
  };

  return WheelView;
}();

WheelView.prototype.attachHandlers = function() {
  function move(options, event) {
    if (options.direction == "up") {
      this.model.setPrevious();
    } else if (options.direction == "down") {
      this.model.setNext();  
    } else {
      this.model.setSelected($(event.currentTarget).text());
    } 
  }

  this.$root.find(".up").on('click', move.bind(this, {direction: "up"})); 
  this.$root.find(".down").on('click', move.bind(this, {direction: "down"})); 
  this.$root.delegate('.not-selected', 'click', move.bind(this, {}));
}


WheelView.prototype.render = function() {
  function setLists(view) {
    var data = this.model.toJSON(),
        array = data.array,
        selected = data.selected,
        indexOfSelected = array.indexOf(selected);
    this.previousList = [];
    this.laterList = [];
    // Two list separated by the selected value
    if (indexOfSelected != -1 ) {
      this.previousList = array.slice(0, indexOfSelected);
      this.laterList = array.slice(indexOfSelected + 1, array.length);
    // Just one list
    } else {
      this.previousList = array;
    }
  }

  function rerender () {
    setLists.apply(this);
    renderValues.apply(this);
  }

  function renderValues() {
    var $list = this.$root.find(".redwheel-list").html('');
    renderList(this.previousList, $list)
    renderSelectedValue(this.model.selected, $list)
    renderList(this.laterList, $list);
  }

  function renderSelectedValue(value, $list) {
    $list.append("<div class='selected'><span>" + value + "</span><div>");
  }
  function renderList(values, $list) {
    values.forEach(function(value) {
      $list.append("<li><span class='not-selected'>" + value + "<span></li>");
    });
  }

  setLists.apply(this);
  var html = "<div class='" + this.root + "'><span class='up'>up</span><ul class='redwheel-list'></ul><span class='down'>down</span></div>";
  $(this.el).wrap(html);
  this.$root = $("." + this.root);
  renderValues.apply(this);
  this.model.onChange(rerender.bind(this));
  return this;
};

var Utils = function() {
  function randomId() {
    return Math.floor(Math.random() * 1000); 
  }
  function getMonthNames() {
    return ["January", "February", "March",
                "April", "May", "June", "July",
                "August", "September", "October",
                "November", "December"];
  }
  function isLeapYear (year) {
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  }
  function monthDaysMap(year) {
    return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  }
  function daysInAMonth(month, year) {
    return monthDaysMap(year)[month - 1];
  }
  function range(min, max) {
    return Array.apply(null, {length: max - min}).map(function(value, index) {
      return (index + min).toString();
    })
  }

  return {
    daysInAMonth: daysInAMonth,
    range: range,
    getMonthNames: getMonthNames,
    randomId: randomId
  };
}();

document.addEventListener("DOMContentLoaded", function() {
  var dayNode = document.getElementById("day-wheel"),
      monthNode = document.getElementById("month-wheel"),
      yearNode = document.getElementById("year-wheel"),
      years = Utils.range(1920, 2040),
      months = Utils.getMonthNames(),
      dayWheel = new RedWheel({el: dayNode, array: Utils.range(1, Utils.daysInAMonth(1, years[0])), selected: "8"}),
      monthWheel = new RedWheel({el: monthNode, array: Utils.getMonthNames(), selected: "March"}),
      yearWheel = new RedWheel({el: yearNode, array: years, selected: years[0]});
});
