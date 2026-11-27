module RenderedMultiSelect
  class Engine < ::Rails::Engine
    
    initializer "rendered-multi-select" do
      ActiveSupport.on_load(:action_view) do
        include RenderedMultiSelect::RenderedMultiSelectHelpers
      end
    end
    
  end
end