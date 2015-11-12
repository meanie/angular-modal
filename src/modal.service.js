
/**
 * Module definition and dependencies
 */
angular.module('Modal.Service', [])

/**
 * Service definition
 */
.provider('$modal', function $modalProvider() {

  /**
   * Defaults
   */
  this.defaults = {
    closeOnEsc: true,
    closeOnClick: true,
    template: null,
    templateUrl: null,
    scope: null,
    controller: null,
    controllerAs: null,
    resolve: {},
    locals: null,
    appendTo: null,
    overlay: true,
    wrapperClass: 'modal-wrapper',
    overlayClass: 'modal-overlay'
  };

  /**
   * Store of predefined modal configs
   */
  this.configs = {};

  /**
   * Set defaults
   */
  this.setDefaults = function(defaults) {
    this.defaults = angular.extend(this.defaults, defaults || {});
    return this;
  };

  /**
   * Predefine a modal config
   */
  this.modal = function(name, config) {

    //Object hash given?
    if (name && typeof name === 'object') {
      angular.forEach(name, function(config, name) {
        this.modal(name, config);
      }, this);
      return;
    }

    //Set config and return self
    this.configs[name] = angular.extend({}, this.defaults, config || {});
    return this;
  };

  /**
   * Service getter
   */
  this.$get = function(
    $rootScope, $q, $templateRequest, $injector,
    $controller, $compile, $document, $animate
  ) {

    //Get defaults and configs
    var defaults = this.defaults;
    var configs = this.configs;

    //Global overlay element
    var overlayElement;

    /**
     * Helper to get template promise
     */
    function getTemplatePromise(template, templateUrl) {
      if (template) {
        return $q.when(template);
      }
      return $templateRequest(templateUrl, true);
    }

    /**
     * Helper to get resolve promises
     */
    function getResolvePromises(resolves) {
      var promises = [];
      angular.forEach(resolves, function(item) {
        if (angular.isFunction(item) || angular.isArray(item)) {
          promises.push($q.when($injector.invoke(item)));
        }
        else if (angular.isString(item)) {
          promises.push($q.when($injector.get(item)));
        }
        else {
          promises.push($q.when(item));
        }
      });
      return promises;
    }

    /**
     * Append element to parent using the animate service
     */
    function appendAnimated(child, parent) {
      var children = parent.children();
      if (children.length > 0) {
        return $animate.enter(child, parent, children[children.length - 1]);
      }
      return $animate.enter(child, parent);
    }

    /**
     * Helper to create overlay element
     */
    function createOverlay(modalInstance, overlayClass) {

      //Create element
      overlayElement = angular.element('<div></div>').attr({
        class: overlayClass
      });

      //Animate in
      return appendAnimated(overlayElement, $document.find('body').eq(0));
    }

    /**
     * Helper to open a modal
     */
    function openModal(modalInstance) {

      //Access modal data object
      var modal = modalInstance.$$modal;

      //Create then compile modal element
      modal.element = angular.element('<div></div>').attr({
        class: modal.wrapperClass
      }).html(modal.content);
      modal.element = $compile(modal.element)(modal.scope);

      //Close on click?
      if (modal.closeOnClick) {
        modal.element.on('click', function(event) {
          if (event.target === event.currentTarget) {
            event.preventDefault();
            event.stopPropagation();
            $rootScope.$apply(function() {
              closeModal(modalInstance, 'cancel', true);
            });
          }
        });
      }

      //Append animated and resolve opened deferred
      return appendAnimated(modal.element, modal.parent).then(function() {
        modal.openedDeferred.resolve(modalInstance);
      }, function(reason) {
        modal.openedDeferred.reject(reason);
      });
    }

    /**
     * Helper to close a modal
     */
    function closeModal(modalInstance, result, wasDismissed) {

      //Access modal data object
      var modal = modalInstance.$$modal;

      //No element present?
      if (!modal.element) {
        return $q.when(true);
      }

      //Did we get a result
      if (wasDismissed) {
        modal.resultDeferred.reject(result);
      }
      else {
        modal.resultDeferred.resolve(result);
      }

      //If overlay element present, remove it
      if (overlayElement) {
        $animate.leave(overlayElement).finally(function() {
          overlayElement = null;
        });
      }

      //Animate out
      return $animate.leave(modal.element).then(function() {

        //Clean up scope
        if (modal.scope) {
          modal.scope.$destroy();
          modal.scope = null;
        }

        //Remove element reference
        modal.element = null;

        //Remove event listener
        if (modal.closeOnEsc) {
          $document[0].removeEventListener('keydown', modal.closeOnEsc);
          modal.closeOnEsc = null;
        }
      });
    }

    /**
     * Class definition
     */
    var Modal = {

      /**
       * Open a new modal
       */
      open: function(name, options) {

        //No name given?
        if (typeof name !== 'string') {
          options = name || {};
          name = '';
        }

        //Name given? Merge with predefined configs
        if (name && configs[name] !== 'undefined') {
          options = angular.extend({}, configs[name], options || {});
        }
        else if (name) {
          throw new Error('String given as options, but config with name ' +
            options + ' was not predefined');
        }

        //Validate options
        options = angular.extend({}, defaults, options || {});
        options.resolve = options.resolve || {};
        options.appendTo = options.appendTo || $document.find('body').eq(0);

        //Must have either template or template url specified
        if (!options.template && !options.templateUrl) {
          throw new Error('One of template or templateUrl options is required.');
        }

        if (!options.appendTo.length) {
          throw new Error('Element to append modal to not found in the DOM.');
        }

        //Prepare modal data object
        var modal = {
          openedDeferred: $q.defer(),
          resultDeferred: $q.defer(),
          parent: options.appendTo,
          wrapperClass: options.wrapperClass,
          closeOnClick: options.closeOnClick
        };

        //Create modal instance
        var modalInstance = {
          $$modal: modal,
          opened: modal.openedDeferred.promise,
          result: modal.resultDeferred.promise,
          close: function(result) {
            return closeModal(modalInstance, result);
          },
          dismiss: function(reason) {
            return closeModal(modalInstance, reason, true);
          }
        };

        //Close on escape?
        if (options.closeOnEsc) {
          modal.closeOnEsc = function(event) {
            var key = event.keyCode || event.which;
            if (key === 27) {
              $rootScope.$apply(function() {
                closeModal(modalInstance, 'cancel', true);
              });
            }
          };
          $document[0].addEventListener('keydown', modal.closeOnEsc);
        }

        //Wait for template and resolves to resolve
        $q.all([
          getTemplatePromise(options.template, options.templateUrl)
        ].concat(getResolvePromises(options.resolve))).then(function(resolves) {

          //Get template content
          modal.content = resolves.shift();

          //Determine modal scope and link close/dismiss handlers
          modal.scope = (options.scope || $rootScope).$new();
          modal.scope.$close = modalInstance.close;
          modal.scope.$dismiss = modalInstance.dismiss;

          //Controller given?
          if (options.controller) {

            //Initialize controller vars
            var locals = {};

            //Provide scope and modal instance
            locals.$scope = modal.scope;
            locals.$modalInstance = modalInstance;

            //Provide other passed locals
            if (options.locals && typeof options.locals === 'object') {
              angular.forEach(options.locals, function(value, key) {
                locals[key] = value;
              });
            }

            //Provide resolved values
            angular.forEach(options.resolve, function(value, key) {
              locals[key] = resolves.shift();
            });

            //Create controller instance
            modal.controller = $controller(options.controller, locals);
            if (options.controllerAs) {
              modal.scope[options.controllerAs] = modal.controller;
            }
          }

          //Open modal now
          openModal(modalInstance);

          //Create overlay
          if (options.overlay) {
            createOverlay(modalInstance, options.overlayClass);
          }
        }, function(reason) {
          modal.openedDeferred.reject(reason);
          modal.resultDeferred.reject(reason);
        });

        //Return modal instance
        return modalInstance;
      }
    };

    //Return the service
    return Modal;
  };
});
