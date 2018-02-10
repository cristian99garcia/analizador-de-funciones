Math.sec=function(x) { return 1 / Math.cos(x); }
Math.csc=function(x) { return 1 / Math.sin(x); }
Math.cot=function(x) { return 1 / Math.tan(x); }
Math.asec=function(x) { return Math.acos(1 / x); }
Math.acsc=function(x) { return Math.asin(1 / x); }
Math.acot=function(x) { return Math.atan(1 / x); }
Math.ln=function(x) { return Math.log(x); }
//Math.log=function(x) { return Math.log(x) / Math.log(10); }
Math.sinh=function(x) { return (Math.exp(x) - Math.exp(-x)) / 2; }
Math.cosh=function(x) { return (Math.exp(x) + Math.exp(-x)) / 2; }
Math.tanh=function(x) { return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x)); }
Math.asinh=function(x) { return Math.log(x + Math.sqrt(x * x + 1)); }
Math.acosh=function(x) { return Math.log(x + Math.sqrt(x * x - 1)); }
Math.atanh=function(x) { return 0.5 * Math.log((1 + x) / (1 - x)); }
Math.sech=function(x) { return 2 / (Math.exp(x) + Math.exp(-x)); }
Math.csch=function(x) { return 2 / (Math.exp(x) - Math.exp(-x)); }
Math.coth=function(x) { return (Math.exp(x) + Math.exp(-x)) / (Math.exp(x) - Math.exp(-x)); }
Math.asech=function(x) { return Math.log(1 / x + Math.sqrt(1 / x / x - 1)); }
Math.acsch=function(x) { return Math.log(1 / x + Math.sqrt(1 / x / x + 1)); }
Math.acoth=function(x) { return 0.5 * Math.log((1 + x) / (1 - x)); }
Math.u=function(x) { return (x >= 0); }

Math.Function = function(eq) {
  var f = {
    parsed: null,
    parseEquationError: "",
    vars: { "x": 0, "theta": 0 },

    parseEquationHasElement: function(v, e) {
      for (var i=0; i<v.length; i++)
        if (v[i] == e)
          return true;
        return false;
    },

    parseEquationIsArray: function(v) {
      if (v == null) { return 0; }
      if (v.constructor.toString().indexOf("Array") == -1)
        return false;
      return true;
    },

    parseEquationJoinArray: function(v) {
      var t = "";
      for (var i=0; i<v.length; i++) {
        if (this.parseEquationIsArray(v[i])) {
          t += this.parseEquationJoinArray(v[i]);
        } else {
          t += v[i];
        }
      }

      t = t.replace("e", "Math.E")
           .replace("pi", "Math.PI");

      return t;
    },

    parseEquationFixFunctions: function(v) {
      if (v==null) {
        parseEquationError? null: parseEquationError = "syntax error";
        return null;
      }

      for (i=0; i<v.length; i++) {
        if (this.parseEquationIsArray(v[i])) {
          v[i] = this.parseEquationFixFunctions(v[i]);
          if (v[i] == null) {
            parseEquationError? null: parseEquationError = "syntax error";
            return null;
          }
        }
      }

      for (var i=0; i<v.length; i++) {
        if (!this.parseEquationIsArray(v[i])) {
          if (Math[v[i]] != undefined) {
            if (v[i + 1] == null) {
              parseEquationEror = "function " + v[i] + " requires an argument.";
              return null;
            }

            v[i] = "Math." + v[i].toLowerCase();
            v.splice(i, 2, new Array("(", v[i], v[i + 1], ")"));
            i--;
          }
        }
      }

      return v;
    },

    parseEquationFixPowers: function(v) {
      if (v == null) {
        parseEquationError? null: parseEquationError = "syntax error";
        return null;
      }

      for (i=0; i<v.length; i++) {
        if (this.parseEquationIsArray(v[i])) {
          v[i] = this.parseEquationFixPowers(v[i]);
          if (v[i] == null) {
            parseEquationError? null: parseEquationError = "syntax error";
            return null;
          }
        }
      }

      for (var i=0; i<v.length; i++) {
        if (v[i] == "^") {
          if (v[i - 1] == null || v[i + 1] == null) {
            parseEquationError = "^ requires two arguments, for example x^2 or (x+1)^(x+2).";
            return null;
          }

          v.splice(i - 1, 3, new Array("Math.pow", new Array("(", v[i - 1], "," , v[i + 1], ")")));
          i -= 2;
        }
      }

      return v;
    },

    tokenize: function(eq, vars, nofix) {
      var jeq = null;
      var tokens;
      var e;
      var i;
      var pstart = -1;
      var pend;

      if (!eq) {
        eq = this.eq;
      }

      if (!vars) {
        vars = this.vars;
      }

      jeq_error = "";
      e = eq.replace(/ /g,"");
      e = e.replace(/([0-9])([a-df-z]|[a-z][a-z]|\()/ig, "$1*$2");
      e = e.replace(/(\))([0-9a-df-z]|[a-z][a-z]|\()/ig, "$1*$2");
      e = e.replace(/([a-z0-9\.])([^a-z0-9\.])/ig, "$1 $2");
      e = e.replace(/([^a-z0-9\.])([a-z0-9\.])/ig, "$1 $2");
      e = e.replace(/(\-|\)|\()/g, " $1 ");
      tokens = e.split(/ +/);

      for (i=0; i<tokens.length; i++) {
        tokens[i] = tokens[i].replace(/ /g, "");
        tokens[i] = tokens[i].replace(/_/g, ".");
        if (tokens[i] == "") {
          tokens.splice(i, 1);
          i--;
        } else if (tokens[i].match(/^[a-z][a-z0-9]*$/i) && vars[tokens[i]] !== undefined) {
          tokens[i] = "vars." + tokens[i];
        } else if(tokens[i] == "pi") {
          tokens[i] = "pi";
        //  tokens[i] = "" + Math.PI
        } else if (tokens[i] == "e") {
          tokens[i] = "e";
        //  tokens[i] = "" + Math.E
        } else if (tokens[i].length > 0 && tokens[i].match(/^[a-z][a-z0-9]*$/i) && Math[tokens[i]] == undefined) {
          parseEquationError = "invalid variable or function: " + tokens[i];
          return null;
        }
      }

      while (this.parseEquationHasElement(tokens, "(") || this.parseEquationHasElement(tokens, ")")) {
        pstart =-1;
        
        for (i=0; i<tokens.length; i++) {
          if (tokens[i] == "(") pstart=i;
          if (tokens[i] == ")" && pstart==-1) {
            parseEquationError="unmatched right parenthesis )";
            return null;
          }

          if (tokens[i] == ")" && pstart!=-1) {
            tokens.splice(pstart,i-pstart+1,tokens.slice(pstart,i+1));
            i = -1;
            pstart = -1;
          }
        }

        if (pstart != -1) {
          parseEquationError = "unmatched left parenthesis (";
          return null;
        }
      }

      tokens = this.parseEquationFixFunctions(tokens);
      if (tokens == null) { return null; }
      tokens = this.parseEquationFixPowers(tokens);
      if (tokens == null) { return null; } 
      return tokens;
    },
  }

  var F = function(x) {
    f.vars.x = x;
    return f.parsed();
  }

  F.f = f;
  F.vars = f.vars;
  F.tokens = f.tokenize(eq, f.vars, true);
  //F.test = algebrize(F.tokens);
  //console.log(F.test);

  f.parsed = function(vars) {
    if (!vars) vars = f.vars;
    return eval(f.parseEquationJoinArray(F.tokens));
  }

  F.toString = function() {
    return eq
  }

  return F;
}

var algebrize = function(expr) {
  var f = Math.Function(expr);
  var unified = unifyTokens(f.tokens);
  var rpn = RPN(unified);

  return parseRPN(rpn);
}

Math.Limit = function(f, value, side) {
  // TODO

  // F(x)
  // x -> value

  var v = 0.00000000000001;
  var r;

  if (!side) {
    return f(value);
  } else if (side === "+") {
    r = f(value);
    if (!isFinite(r)) {
      if (f(value + v) > 0) {
        return Infinity;
      } else {
        return -Infinity;
      }
    } else {
      if (f(value + v) > r) {
        return r; // +
      } else {
        return r; // -
      }
    }
  } else if (side === "-") {
    r = f(value);
    if (!isFinite(r)) {
      if (f(value - v) > 0) {
        return Infinity;
      } else {
        return -Infinity;
      }
    } else {
      //console.log(r, f(value), f(value + r));
      if (f(value + v) > r) {
        return r; // +
      } else {
        return r; // -
      }
    }
  }
}


Math.Limit = function(expr, z0, dir) {
  // lim expr(var)
  // x -> z0[dir]

  if (!dir) dir = "+";

  /*
  if hints.get('deep', True):
      e = e.doit(**hints)
      z = z.doit(**hints)
      z0 = z0.doit(**hints)
  */

  /*
  if (e == z) {
    return z0;
  }
  */

  //if not e.has(z):
  //    return e

  /*
  if (z0 > 0):
      e = e.rewrite([factorial, RisingFactorial], gamma)
  */

  if (e.isMul()) {
    if (!isFinite(z0)) {
    }
  }

  try {
    console.log("gruntz");
  } catch (error) {
    var r = 0;  // heuristics(e, z, z0, dir);
    if (r === null) {
      return this;
    }
  }
  /*
  if e.is_Mul:
      if abs(z0) is S.Infinity:
          e = factor_terms(e)
          e = e.rewrite(fibonacci, GoldenRatio)
          ok = lambda w: (z in w.free_symbols and
                          any(a.is_polynomial(z) or
                              any(z in m.free_symbols and m.is_polynomial(z)
                                  for m in Mul.make_args(a))
                              for a in Add.make_args(w)))
          if all(ok(w) for w in e.as_numer_denom()):
              u = Dummy(positive=True)
              if z0 is S.NegativeInfinity:
                  inve = e.subs(z, -1/u)
              else:
                  inve = e.subs(z, 1/u)
              r = limit(inve.as_leading_term(u), u, S.Zero, "+")
              if isinstance(r, Limit):
                  return self
              else:
                  return r

  if e.is_Order:
      return Order(limit(e.expr, z, z0), *e.args[1:])

  try:
      r = gruntz(e, z, z0, dir)
      if r is S.NaN:
          raise PoleError()
  except (PoleError, ValueError):
      r = heuristics(e, z, z0, dir)
      if r is None:
          return self
  except NotImplementedError:
      # Trying finding limits of sequences
      if hints.get('sequence', True) and z0 is S.Infinity:
          trials = hints.get('trials', 5)
          r = limit_seq(e, z, trials)
          if r is None:
              raise NotImplementedError()
      else:
          raise NotImplementedError()

  return r
  */
}


Math.Summation = function(fun, lower, upper) {
  var s = {
    function: fun,
    lower: lower,
    upper: upper,

    eval: function() {
      if (this.lower == -Infinity || this.upper == Infinity) {
        var exception = new "Can't evaluate Infinity summations";
        throw exception.msg;
      }

      var val = 0;

      for (var i=this.lower; i<this.upper; i++) {
        val += this.function(i);
      }

      return val;
    },
  }

  return s;
}