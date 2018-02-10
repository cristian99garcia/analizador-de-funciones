LEFT_ASSOC = 0
RIGHT_ASSOC = 1

OPERATORS = {
  "+": [0, LEFT_ASSOC],
  "-": [0, LEFT_ASSOC],
  "*": [5, LEFT_ASSOC],
  "/": [5, LEFT_ASSOC],
  "**": [20, RIGHT_ASSOC],
  "log": [6, LEFT_ASSOC],
  "ln": [6, LEFT_ASSOC],
  "cos": [6, LEFT_ASSOC],
  "sen": [6, LEFT_ASSOC],
  "tan": [6, LEFT_ASSOC],
  "sqrt": [8, LEFT_ASSOC],
}

var unifyTokens = function(tokens, dontClean) {
  var t = [];

  for (var i=0; i<tokens.length; i++) {
    if (tokens[i].constructor.toString().indexOf("Array") !== -1) {
      unifyTokens(tokens[i], true).forEach(function(_t) {
        t.push(_t);
      });
    } else {
      if (tokens[i].startsWith("vars.") || tokens[i].startsWith("Math.")) {
        t.push(tokens[i].split(".")[1]);
      } else {
        t.push(tokens[i]);
      }
    }
  }

  if (!dontClean) {
    var _t = [];
    var last = "";
    var negative = false;

    t.forEach(function(value) {
      if (last in OPERATORS && value == "-") {
        negative = true;
        return;
      }

      last = value;

      _t.push(value);
      if (negative) {
        _t[_t.length - 1] = "-" + _t[_t.length - 1];
      }

      negative = false;
    });

    t = _t;
  }

  return t;
}

var RPN = function(tokens) {
  // Reverse Polish Notation

  var cleanToken = function(token) {
    if (token.length > 1 && token.startsWith("-")) {
      token = token.slice(1, token.length);
    }

    return token;
  }

  var isOperator = function(token) {
    return cleanToken(token) in OPERATORS;
  }

  var isAssociative = function(token, assoc) {
    if (!isOperator(cleanToken(token))) {
      throw "Invalid token: " + cleanToken(token);
    }

    return OPERATORS[cleanToken(token)][1] == assoc;
  }

  var CMPPrecedence = function(token1, token2) {
    if (!isOperator(token1) || !isOperator(token2)) {
      throw "Invalid tokens: " + token1 + ", " + token2;
    }

    return OPERATORS[cleanToken(token1)][0] - OPERATORS[cleanToken(token2)][0]
  }

  var out = [];
  var stack = [];
  var count = -1;
  var idx = 0;

  tokens.forEach(function(token) {
    count++;

    //console.log(idx, token);
    if (isOperator(token)) {
      while (stack.length > 0 && isOperator(stack[stack.length - 1])) {
        if ((isAssociative(token, LEFT_ASSOC) && CMPPrecedence(token, stack[stack.length - 1]) <= 0) ||
            (isAssociative(token, RIGHT_ASSOC) && CMPPrecedence(token, stack[stack.length -1]))) {

          //if (idx >= 1) {
          //  out.push("-" + stack.pop());
          //} else {
            out.push(stack.pop());
          //}

          continue;
        }

        break;
      }

      if (idx === 1) {
        if (token != "+" && !token.startsWith("-")) {
          stack.push("-" + token);
        } else {
          stack.push(token);
        }
      } else {
        stack.push(token);
      }
    } else if (token == "(") {
      stack.push(token);
      if (idx > 0) {
        idx ++;
      }
    } else if (token == "-(") {
      idx += 1;
      stack.push("(");
    } else if (token == ")") {
      idx--;
      while (stack.length > 0 && stack[stack.length - 1] !== "(") {
        if (idx === 1) {
          out.push("-" + stack.pop());
        } else {
          out.push(stack.pop());
        }
      }

      stack.pop();
    } else {
      if (idx == 1) {
        out.push("-" + token);
      } else {
        out.push(token);
      }
    }
  });

  while (stack.length > 0) {
    out.push(stack.pop());
  }

  return out;
}

Math.Object = function(valuesCount) {
  this.valuesCount = valuesCount;
}

Math.Object.prototype.getName = function() {
  return this.__proto__.constructor.name;
}

Math.Object.prototype.isMul = function() {
  return this.getName() === "Multiplication";  // Power?
}

Math.Object.prototype.isAdd = function() {
  return this.getName() === "Add";
}

Math.Object.prototype.isPower = function() {
  return this.getName() === "Power";
}

function OneValue(value, symbol) {
  Math.Object.call(this, 1);
  this.value = value;
  this.symbol = symbol;
}

OneValue.prototype = Object.create(Math.Object.prototype);
OneValue.prototype.constructor = OneValue;

OneValue.prototype.toString = function() {
  if (this.symbol !== undefined) {
    return this.symbol + "(" + this.value + ")";
  } else {
    return "" + this.value;
  }
}

function TwoValues(value1, value2, symbol) {
  Math.Object.call(this, 2);

  this.value1 = value1;
  this.value2 = value2;
  this.symbol = symbol;
}

TwoValues.prototype = Object.create(Math.Object.prototype);
TwoValues.prototype.constructor = TwoValues;

TwoValues.prototype.toString = function() {
  return this.value1 + " " + this.symbol + " " + this.value2;
}

function Null(value) { OneValue.call(this, value, "N"); }
function Ln(value) { OneValue.call(this, value, "Ln"); }
function Log(value) { OneValue.call(this, value, "Log"); }
function Sqrt(value) { OneValue.call(this, value, "Sqrt"); }
function cos(value) { OneValue.call(this, value, "cos"); }
function sen(value) { OneValue.call(this, value, "sen"); }
function tan(value) { OneValue.call(this, value, "tan"); }

var ONE_VALUE = {
  "ln": Ln,
  "log": Log,
  "sqrt": Sqrt,
  "cos": cos,
  "sen": sen,
  "tan": tan,
  "": Null,
}

Object.values(ONE_VALUE).forEach(function(f) {
  f.prototype = Object.create(OneValue.prototype);
  f.prototype.constructor = f;
});

function Add(value1, value2, opposite) {
  TwoValues.call(this, value1, value2, !opposite? "+": "-");
}

function Multiplication(value1, value2, reverse) { TwoValues.call(this, value1, value2, !reverse? "*": "/"); }
function Power(value1, value2) { TwoValues.call(this, value1, value2, "**"); }

var TWO_VALUES = {
  "+": Add,
  "-": Add,
  "*": Multiplication,
  "/": Multiplication,
  "**": Power,
}

Object.values(TWO_VALUES).forEach(function(f) {
  f.prototype = Object.create(TwoValues.prototype);
  f.prototype.constructor = f;
});

Add.prototype.toString = function() {
  if (this.symbol !== "-" || this.value1.toString() !== "0") {
    return this.value1 + " " + this.symbol + " " + this.value2;
  } else {
    return "-" + this.value2.toString();
  }
}

Multiplication.prototype.toString = function() {
  var isMultiple = function(value) {
    if (!value || typeof(value) === "string" || value.getName() === "OneValue") {
      return false;
    }

    var n = value.getName();
    return (n === "Add");
  }

  var s = "";
  if (isMultiple(this.value1)) {
    s = "(" + this.value1 + ") "
  } else {
    s = this.value1 + " ";
  }

  s += this.symbol;

  if (isMultiple(this.value2)) {
    s += " (" + this.value2 + ")";
  } else {
    s += " " + this.value2;
  }

  return s;
}

parseRPN = function(expression) {
  var stack = [];

  var count = 0;
  var negative;
  var block;

  var op1, op2;

  expression.forEach(function (val) {
    negative = false;

    val = ""+val;
    if (val.startsWith("-") && (val !== "-" || count === 0)) {
      negative = true;
      val = val.substring(1, val.length);
    } else if (val === "-" && count === expression.length - 1 && stack.length === 1) {
      stack[0] = Add(new OneValue("0"), stack[0], true);
      return;
    }

    if (val in ONE_VALUE) {
      op1 = stack.pop();
      block = new ONE_VALUE[val](op1);
    } else if (val in TWO_VALUES) {
      op1 = stack.pop();
      op2 = stack.pop();
      block = new TWO_VALUES[val](op2, op1, (val === "-" || val === "/"));
    } else {
      block = new OneValue(val);
    }

    if (negative) {
      block = new Add(new OneValue("0"), block, true);
    }

    count++;

    stack.push(block);
  });

  return stack.pop();
}
