/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const _ = require('lodash');

class RenderedMultiSelect {
  constructor(element, options) {
    this.element = element;
    this.options = options;
    if (this.element.data("readonly") === "true") { return; }
    this.body = $('body');
    this.win  = $(window);
    this.inputContainer = this.element.find(".rendered-multi-select-input");
    this.input = this.inputContainer.find(".editable-input");
    this.createResultMenu();
    this.registerElementEvents();
    this.registerResultMenuEvents();
    this.multiple = this.element.data("multiple") === true;
    this.lastName = null;
    this.configureMultiple();
    this.blurTimeout = null;
  }

  registerElementEvents() {
    this.element.on("keydown", ".editable-input", event => {
      return this.inputKeyDown(event);
    });
    this.element.on('keyup', '.editable-input', _.throttle((() => {
      return this.updateQuery();
    }
      ), 200)
    );
    this.element.on("blur", ".editable-input", event => {
      // Create any partially edited item if it allows new options
      let index;
      if (this.input.text() && ((index = this.resultList.find("li").map(function() { return $(this).text().toLowerCase(); }).get().indexOf(this.input.text().toLowerCase())) >= 0)) {
        this.addItem(this.resultList.find("li").eq(index));
      } else if (this.options.allowNew) {
        this.createNewItem(this.input.text());
      }

      return this.blurTimeout = setTimeout(() => {
          this.blurTimeout = null;
          this.input.html("");
          this.hideResultMenu(true);
          return this.element.removeClass("rendered-multi-select-active");
        }
        , 200);
    });
    this.element.on("focus", ".editable-input", event => {
      if (this.blurTimeout) { clearTimeout(this.blurTimeout); }
      this.element.addClass("rendered-multi-select-active");
      this.lastName = null;
      return this.updateQuery();
    });
    this.element.on("click", ".rendered-multi-select-element b", event => {
      this.deleteItem($(event.target).parent(".rendered-multi-select-element"));
      return event.stopPropagation();
    });
    this.element.on("click", event => {
      // Focus the input when user clicks on the control.
      if (!this.input.is(":focus")) {
        if (this.blurTimeout) { clearTimeout(this.blurTimeout); }
        if (this.input[0]) { return this.input[0].focus(); }
      }
  });

    return this.element.on("change", event => {
      return this.configureMultiple();
    });
  }

  registerResultMenuEvents() {
    this.resultMenu.off("click.renderedMultiSelect");
    this.resultMenu.on("click.renderedMultiSelect", "li", event => {
      this.addItem($(event.target));
      return event.stopPropagation();
    });
    this.resultMenu.off("focus.renderedMultiSelect");
    this.resultMenu.on("focus.renderedMultiSelect", event => {
      if (!this.input.is(":focus")) {
        if (this.blurTimeout) { clearTimeout(this.blurTimeout); }
        if (this.input[0]) { return this.input[0].focus(); }
      }
  });
    this.resultMenu.off("mousedown.renderedMultiSelect");
    return this.resultMenu.on("mousedown.renderedMultiSelect", event => {
      return false;
    });
  }

  configureMultiple() {
      // For non-multiple item controls hide input if an item exists.
      if (!this.multiple) {
        if (this.element.find(".rendered-multi-select-element").length > 0) {
          return this.inputContainer.hide();
        } else {
          return this.inputContainer.show();
        }
      }
    }

  createResultMenu() {
    this.resultMenu = $("<div class='rendered-multi-select-menu'><ul class='rendered-multi-select-results'></ul></div");

    if (this.element.attr("data-fixed-menu") === "true") {
      this.resultMenu.addClass('fixed');
      this.body.append(this.resultMenu);
    } else {
      this.resultMenu.insertAfter(this.input);
    }

    return this.resultList = this.resultMenu.find("ul");
  }

  showResultMenu() {
    if (this.element.attr("data-fixed-menu") !== "true") { return this.resultMenu.show(); }
    if (this.inputContainer.is(":hidden")) { return; }

    const winHeight = this.win.height();
    const inputTop  = this.inputContainer.offset().top;
    const elemLeft  = this.element.offset().left;
    const scrollTop = this.body.scrollTop();
    const rules     = {
      display: 'block',
      left:    elemLeft - this.body.scrollLeft(),
      width:   this.element.width()
    };

    if ((winHeight / 2) < (inputTop - scrollTop)) {
      rules.bottom = (winHeight - inputTop) + scrollTop;
      rules.top = "";
    } else {
      rules.top = (inputTop - scrollTop) + this.inputContainer.height();
      rules.bottom = "";
    }

    this.resultMenu.css(rules);
    this.body.css({overflow: 'hidden'});
  }

  hideResultMenu(fade) {
    if (fade == null) { fade = false; }
    if (this.element.attr("data-fixed-menu") === "true") { this.body.css({overflow: 'auto'}); }
    return this.resultMenu[fade ? 'fadeOut' : 'hide']();
  }

  inputKeyDown(event) {
    let index, result;
    switch (event.keyCode) {
      case 13: // Enter
        if ((result = this.resultList.find("li").filter(".selected")).length !== 0) {
          this.addItem(result);
        } else if (this.resultList.find("li").length === 1) {
          this.addItem(this.resultList.find("li").first());
        } else if ((index = this.resultList.find("li").map(function() { return $(this).text().toLowerCase(); }).get().indexOf(this.input.text().toLowerCase())) >= 0) {
          this.addItem(this.resultList.find("li").eq(index));
        } else if (this.options.allowNew) {
          this.createNewItem(this.input.text());
        }
        break;
      case 40: // Down arrow
        this.selectNextResult(1);
        break;
      case 38: // Up arrow
        this.selectNextResult(-1);
        break;
      case 8: // Backspace
        if (this.input.text().length > 0) {
          return;
        } else {
          this.deleteLastItem();
        }
        break;
      default:
        // Perform the default.
        return;
    }
    event.stopPropagation();
    return event.preventDefault();
  }

  escapeAttr(v) {
    if (v != null) { return v.replace(/'/g, '&apos;').replace(/"/g, '&quot;'); }
  }

  clearInput() {
    this.lastName = null;
    this.input.text("");
    return this.hideResultMenu();
  }

  createNewItem(name) {
    name = $.trim(name);
    if (name.length === 0) { return; }
    if (this.itemExists(name)) { return; }
    if (this.options.onCreateItem) {
      if (!(name = this.options.onCreateItem(name))) { return; }
    }
    this.addItemRow(_.escape(name), _.escape(name));
    this.clearInput();
    return this.updateQuery();
  }

  deleteLastItem() {
    const lastItem = this.element.find(".rendered-multi-select-element").last();
    if (lastItem.length === 0) { return; }
    this.deleteItem(lastItem);
    this.lastName = null;
    return this.updateQuery();
  }

  deleteItem(item) {
    item.remove();
    if (this.options.onDeleteItem) {
      this.options.onDeleteItem(item.attr("data-id"));
    }
    return this.element.trigger("change");
  }

  updateQuery() {
    const q = $.trim(this.input.text());
    if (this.lastName === q) { return; }
    this.lastName = q;
    if (this.options.onQuery) {
      return this.options.onQuery(q, results => {
        return this.showQueryResults(results);
      });
    }
  }

  showQueryResults(results) {
    let resultAdded;
    if (this.resultList.parents('body').length === 0) {
      this.createResultMenu();
      this.registerResultMenuEvents();
    }

    this.resultList.empty();
    this.resultData = {};

    if ((results.length > 0) && results[0].parent) {
      const groupedResults = this.groupResults(results);
      for (let parent in groupedResults) {
        results = groupedResults[parent];
        if (results.length > 0) {
          this.resultList.append(`<li class='header-row'>${parent}</li>`);
          resultAdded = this.appendResults(results, "has-parent");
        }
      }
    } else {
      resultAdded = this.appendResults(results, "");
    }

    if (resultAdded) {
      // Only if we have focus.
      if ($(this.input).is(":focus")) { return this.showResultMenu(); }
    } else {
      return this.hideResultMenu();
    }
  }

  groupResults(results) {
    const groupedResults = {};
    for (let result of results) {
      if (!groupedResults[result.parent]) { groupedResults[result.parent] = []; }
      groupedResults[result.parent].push(result);
    }
    return groupedResults;
  }

  appendResults(results, classes) {
    // Compute existing items so we can remove duplicates.
    let tooMany;
    const existingIds = this.existingIds();
    const newExistingNames = this.newExistingNames();

    let resultAdded = false;
    let i = 0;
    let max = 500;
    if (results.length < max) {
      max = results.length;
    } else {
      tooMany = true;
    }
    while (i < max) {
      const result = results[i];
      i++;
      if (($.inArray(result.id, existingIds) !== -1) || ($.inArray(result.name, newExistingNames) !== -1)) {
        continue;
      }

      let {
        name
      } = result;
      if ((newExistingNames.length > 0) || (existingIds.length > 0)) {
        name = name.replace(/^(&nbsp;)+/, "");
      }

      const cleanName = _.escape($(`<div>${name}</div>`).text());

      this.resultData[result.id] = name;
      this.resultList.append(`<li class='${classes}' data-id='${this.escapeAttr(result.id)}'>${cleanName}</li>`);
      resultAdded = true;
    }
    if (tooMany) {
      this.resultList.append(`<li class='${classes}' style='color: #ccc;'><small>Too many results, search to display more&#8230;</small></li>`);
    }
    return resultAdded;
  }

  addItem(result) {
    const id = result.attr("data-id");
    if (!id) {
      return false;
    }
    const name = this.resultData[id];
    this.addItemRow(name, id);
    if (this.options.onAddItem) {
      this.options.onAddItem(id, name);
    }
    this.hideResultMenu();
    this.clearInput();
    return this.updateQuery();
  }

  selectNextResult(offset) {
    const items = this.resultList.find("li");
    let currentIndex = items.index(items.filter(".selected"));
    items.removeClass("selected");
    currentIndex += offset;
    if (currentIndex >= items.length) {
      return this.resultList.find("li").first().addClass("selected");
    } else if (currentIndex < 0) {
      return this.resultList.find("li").last().addClass("selected");
    } else {
      return $(items[currentIndex]).addClass("selected");
    }
  }

  addItemRow(name, id) {
    let style;
    if (this.options.onStyleItem) {
      style = this.options.onStyleItem(name);
    } else {
      style = "";
    }
    const row = $(`<li class='rendered-multi-select-element' data-id='${this.escapeAttr(id)}' style='${style}'></li>`);
    row.html(name);
    row.append("<b>&times;</b>");
    this.inputContainer.before(row);
    return this.element.trigger("change");
  }

  itemExists(name) {
    return $.inArray(name, this.existingNames()) !== -1;
  }

  existingNames() {
    return this.element.find(".rendered-multi-select-element")
      .map((index, element) => $(element).text().slice(0,-1)).get();
  }

  newExistingNames() {
    return this.element.find(".rendered-multi-select-element[data-id=undefined]")
      .map((index, element) => $(element).text().slice(0,-1)).get();
  }

  existingIds() {
    return this.element.find(".rendered-multi-select-element")
      .map((index, element) => $(element).attr("data-id")).get();
  }
}

$.fn.renderedMultiSelect = function(options, ...args) {
  return this.each(function() {
    const $this = $(this);
    let data = $this.data('plugin_renderedMultiSelect');

    if (!data) {
      $this.data('plugin_renderedMultiSelect', (data = new RenderedMultiSelect( $this, options)));
    }
    if (typeof options === 'string') {
      return data[options].apply(data, args);
    }
  });
};
