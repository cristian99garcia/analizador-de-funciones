var entriesCount = 0;

var Entry = function(entry) {
  this.focused = false;
  this.entry = entry;
  this.div = this.entry[0];
  this.childs = [];
}

Entry.prototype.hasFocus = function() {
  return this.focused;
}

Entry.prototype.setFocus = function(focused) {
  this.focused = focused;

  if (this.focused) {
    this.entry.focus();
    console.log(this.entry);
  }
}

Entry.prototype.setText = function(text) {
  var _text = "";
  var added = false;

  /*
  for (var i=0; i<text.length; i++) {
    _text += "<var class='char'>" + text[i] + "</var>" + ((i<text.length - 1)? "\n": "");
  }
  */
  _text = text;

  if (_text !== "") {
    this.div.innerHTML = _text;
  }
}

Entry.prototype.getText = function() {
  return this.entry[0].textContent;
}

Entry.prototype.insertExpEntry = function() {
  var id = "entry-" + entriesCount;
  var style = "font-size: 15px;" +
              "position: relative;" +
              "top: 2px;";

  var inner = "<sup><div id='" + id + "' contenteditable='true' style='" + style + "' class='exp-entry'>a</div></sup>";
  this.entry[0].innerHTML += inner;

  var entry = new Entry($(id));
  entry.setFocus(true);
  this.setFocus(false);
  entry.init();
  this.childs.push(entry);

  entriesCount += 1;
}

Entry.prototype.insertAtCursor = function(insertText) {
  /*
  var text = this.getText();
  var newText = text.substring(0, this.cursorPosition) + insertText + text.substring(this.cursorPosition, text.length + 1);
  console.log(newText);
  this.cursorPosition += insertText.length;
  this.setText(newText);
  */
}

Entry.prototype.init = function() {
  var _this = this;
  $(this.entry).on("focusin", function(event) {
    _this.setFocus(true);
  });

  $(this.entry).on("focusout", function(event) {
    _this.setFocus(false);
  });

  $(this.entry).on("keydown", function(event) {
    if (event.key === "Enter") {
      return false;
    } else if (event.originalEvent.code === "Quote") {
      if (_this.hasFocus()) {
        _this.insertExpEntry();
        return false;
      } else {
      }
    } else {
    }
  });
}

var entry = new Entry($("#input-box"));

window.onload = function() {
  entry.init();
}