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
  }
}

Entry.prototype.setInner = function(inner) {
  this.div.innerHTML = inner;
}

Entry.prototype.getInner = function() {
  return this.div.innerHTML;
}

Entry.prototype.setText = function(text) {
  var _text = "";
  var added = false;

  for (var i=0; i<text.length; i++) {
    //console.log(text[i]);
    _text += "<var class='char'>" + text[i] + "</var>";
  }

  this.setInner(_text);
}

Entry.prototype.getText = function() {
  return this.div.textContent;
}

Entry.prototype.insertExpEntryAtCursor = function() {
  var id = "entry-" + entriesCount;
  var style = "font-size: 15px;" +
              /*
              "position: relative;" +
              "top: -40px;" +
              */
              "min-width: 8px;" +
              "width: 8px;" +
              "margin-left: 20px;";

  var inner = this.getInner();
  inner += "<sup><var><div id='" + id + "' contenteditable='true' style='" + style + "' class='exp-entry'>a</div></var></sup>";
  this.setInner(inner);

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

  if (window.getSelection !== undefined) {
    sel = window.getSelection();
    if (sel.rangeCount) {
      range = sel.getRangeAt(0);
      if ([this.div, $("#input-area")[0]].includes(range.commonAncestorContainer.parentNode)) {
        caretPos = range.endOffset;
      } else if (range.commonAncestorContainer.parentNode.className === "char") {
        if (range.commonAncestorContainer.parentNode === null) {
        } else {
          var child = range.commonAncestorContainer.parentNode.previousSibling;

          if (child !== null) {
            caretPos = 2;
            while ((child = child.previousSibling) != null) caretPos++;

          } else {
            caretPos = 1;
          }
        }
      }
    }
  } else if (document.selection && document.selection.createRange) {
    range = document.selection.createRange();
    if (range.parentElement() == this.div) {
      var tempEl = document.createElement("span");
      this.div.insertBefore(tempEl, this.div.firstChild);
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
  range.setStart(this.div, caretPos);
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

  var ignore = ["Alt", "Control", "Delete", "Backspace", "Tab", "Shift", "AltGraph", "ArrowDown", "ArrowLeft", "ArrowUp", "ArrowRight"];
  var special = {"Space": " "};

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
        _this.insertExpEntryAtCursor();
        return false;
      }
    } else if (!ignore.includes(event.key) && !ignore.includes(event.originalEvent.code) && !event.altKey && !event.ctrlKey) {
      if (event.originalEvent.code in special) {
        _this.insertTextAtCursor(special[event.originalEvent.code]);
      } else {
        _this.insertTextAtCursor(event.key);
      }

      return false;
    }
  });

  $(this.entry).bind("DOMSubtreeModified", function() {
    if (_this.div.innerHTML.includes("<br>")) {
      _this.div.innerHTML = _this.div.innerHTML.replaceAll("<br>", "");
    }
  });
}

var entry = new Entry($("#input-box"));

window.onload = function() {
  entry.init();
}
