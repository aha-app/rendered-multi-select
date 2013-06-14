(($, window) ->

  ###
  query: (options) ->
    $.ajax
      type: 'GET'
      url: '/tags?q=' + options.term
      dataType: 'json'
      success: (data) ->
        options.callback
          results: data
          more: false
  ###  
          
          
  class RenderedMultiSelect
    constructor: (@element, @options) ->
      @inputContainer = @element.find(".rendered-multi-select-input")
      @input = @inputContainer.find("input")
      @createResultMenu()
      @registerEvents()

    destroy: () ->
      
    registerEvents: ->
      @element.on "keydown", "input", (event) =>
        @inputKeyDown(event)
      @element.on "keyup", "input", (event) =>
        @updateQuery(event)
      @element.on "click", ".rendered-multi-select-menu li", (event) =>
        @addItem($(event.target).attr("data-id"), $(event.target).html())
      @element.on "click", ".rendered-multi-select-element b", (event) =>
        @deleteItem($(event.target).parent(".rendered-multi-select-element"))
    
    createResultMenu: ->
      @resultMenu = $("<div class='rendered-multi-select-menu'><ul class='rendered-multi-select-results'></ul></div")
      @resultMenu.insertAfter(@input)
      @resultList = @resultMenu.find("ul")
      
    inputKeyDown: (event) ->
      switch event.keyCode
        when 13 # Enter
          @createNewItem(@input.val())
        when 40 # Down arrow
          # Next result
          ""
        when 38 # Up arrow
          # Previous result
          ""
        when 8 # Backspace
          if @input.val().length > 0
            return
          else
            @deleteLastItem()
        else
          # Perform the default.
          return
      event.stopPropagation()
      event.preventDefault()
  
    clearInput: ->
      @input.val("")
      @resultMenu.hide()
      
    createNewItem: (name) ->
      name = $.trim(name)
      return if name.length == 0
      if @options.onCreateItem
        return unless name = @options.onCreateItem(name)
      @clearInput()
      @inputContainer.before("<li class='rendered-multi-select-element'>#{name}<b>x</b></li>")
    
    deleteLastItem: ->
      lastItem = @element.find(".rendered-multi-select-element").last()
      return if lastItem.length == 0
      @deleteItem(lastItem)
      
    deleteItem: (item) ->
      if @options.onDeleteItem
        @options.onDeleteItem(item.attr("data-id"))
      item.remove()
     
    updateQuery: ->
      q = $.trim(@input.val())
      return if q.length == 0
      if @options.onQuery
        @options.onQuery q, (results) =>
          @showQueryResults(results)
    
    showQueryResults: (results) ->
      @resultList.empty()
      for result in results
        @resultList.append("<li data-id='#{result.id}'>#{result.name}</li>")
      @resultMenu.css("left", @input.position().left + "px")
      @resultMenu.show()
      
    addItem: (id, name) ->
      if @options.onAddItem
        @options.onAddItem(id, name)
      @clearInput()
      @inputContainer.before("<li class='rendered-multi-select-element' data-id='#{id}'>#{name}<b>x</b></li>")
      
  $.fn.renderedMultiSelect = (options, args...) ->
    @each ->
      $this = $(this)
      data = $this.data('plugin_renderedMultiSelect')

      if !data
        $this.data 'plugin_renderedMultiSelect', (data = new RenderedMultiSelect( $this, options))
      if typeof options == 'string'
        data[options].apply(data, args)
        
)(jQuery, window)
