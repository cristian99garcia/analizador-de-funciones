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
    //console.log(this.entry);
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

Entry.prototype.insertExpEntryAtCursor = function() {
  var id = "entry-" + entriesCount;
  var style = "font-size: 15px;" +
              "position: relative;" +
              "top: -40px;" +
              "min-width: 8px;" +
              "width: 8px;" +
              "margin-left: 20px;";

  var inner = "<sup><div id='" + id + "' contenteditable='true' style='" + style + "' class='exp-entry'>a</div></sup>";
  this.entry[0].innerHTML += inner;

  var entry = new Entry($(id));
  entry.setFocus(true);
  this.setFocus(false);
  entry.init();
  this.childs.push(entry);

  entriesCount += 1;
}

Entry.prototype.getCaretPosition = function() {
  var caretPos = 0;
  var sel, range;

  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if (range.commonAncestorContainer.parentNode == this.entry[0]) {
        caretPos = range.endOffset;
      }
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    if (range.parentElement() == this.entry[0]) {
      var tempEl = document.createElement("span");
      this.entry[0].insertBefore(tempEl, this.entry[0].firstChild);
      var tempRange = range.duplicate();
      tempRange.moveToElementText(tempEl);
      tempRange.setEndPoint("EndToEnd", range);
      caretPos = tempRange.text.length;
    }
  }

  return caretPos;
}

Entry.prototype.setCaretPosition = function(caretPos) {
  var range = document.createRange();
  var sel = window.getSelection();
  range.setStart(this.entry[0].childNodes[0], caretPos);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

Entry.prototype.insertTextAtCursor = function(insertText) {
  var text = this.getText();
  var cursorPosition = this.getCaretPosition();
  var newText = text.substring(0, cursorPosition) + insertText + text.substring(cursorPosition, text.length + 1);

  this.setText(newText);
  this.setCaretPosition(cursorPosition + insertText.length);
}

Entry.prototype.init = function() {
  var _this = this;

  var ignore = ["Alt", "Control", "Delete", "Backspace", "Tab", "Shift", "AltGraph", "ArrowDown", "ArrowLeft", "ArrowUp", "ArrowRight", "Space"];

  $(this.entry).on("focusin", function(event) {
    _this.setFocus(true);
  });

  $(this.entry).on("focusout", function(event) {
    _this.setFocus(false);
  });

  $(this.entry).on("keydown", function(event) {
    console.log(event.srcElement);
    if (event.key === "Enter") {
      return false;
    } else if (event.originalEvent.code === "Quote") {
      if (_this.hasFocus()) {
        _this.insertExpEntryAtCursor();
        return false;
      } else {
      }
    } else if (!ignore.includes(event.key) && !ignore.includes(event.originalEvent.code) && !event.altKey && !event.ctrlKey) {
      _this.insertTextAtCursor(event.key);
      return false;
    }
  });
}

var entry = new Entry($("#input-box"));

window.onload = function() {
  entry.init();
}