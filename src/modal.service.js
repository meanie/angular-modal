
/**
 * Module definition and dependencies
 */
angular.module('Modal.Service', [
  'ModalStack.Service',
  'ModalOverlay.Service',
  'AppendAnimated.Service',
])

/**
 * Modal service
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
    controllerAs: '$ctrl',
    resolve: {},
    locals: null,
    appendTo: null,
    overlay: true,
    wrapperClass: 'modal-wrapper ModalWrapper',
    overlayClass: 'modal-overlay ModalOverlay',
    onBeforeClose: null,
    once: false,
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
      angular.forEach(name, (config, name) => {
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
    $rootScope, $q, $templateRequest, $injector, $controller,
    $compile, $document, $animate, $modalStack, $modalOverlay,
    $appendAnimated
  ) {

    //Get defaults and configs
    const baseIndex = 10000;
    const defaults = this.defaults;
    const configs = this.configs;

    //Get body element
    const bodyElement = $document.find('body').eq(0);

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
      let promises = [];
      angular.forEach(resolves, item => {
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
     * Helper to open a modal
     */
    function openModal(modalInstance) {

      //Access modal data object
      const modal = modalInstance.$$modal;
      const numModals = $modalStack.numOpen() + 1;

      //Create then compile modal element
      modal.element = angular
        .element('<div></div>')
        .attr({class: modal.wrapperClass})
        .html(modal.content);
      modal.element = $compile(modal.element)(modal.scope);
      modal.element[0].style.zIndex = baseIndex + (2 * numModals) - 1;

      //Close on click handler
      //NOTE: This is applied on the base modal element, e.g. invisible
      //background, not the overlay. This is because clicking on the overlay
      //would then close all modals, which is probably not what you'd want.
      if (modal.closeOnClick) {
        modal.element.on('click', event => {
          if (event.target === event.currentTarget) {
            event.preventDefault();
            event.stopPropagation();
            $rootScope.$apply(() => {
              closeModal(modalInstance, 'cancel', true);
            });
          }
        });
      }

      //Add to stack and show overlay
      $modalStack.add(modalInstance);
      if (modal.showOverlay) {
        $modalOverlay.show(modal.overlayClass);
        $modalOverlay.setIndex(baseIndex, numModals);
      }

      //Call controller on init now
      if (modal.controller && modal.controller.$onInit) {
        modal.controller.$onInit.call(modal.controller);
      }

      //Append animated and resolve opened deferred
      return $appendAnimated(modal.element, modal.parent)
        .then(() => {

          //Call controller $postLink
          if (modal.controller && modal.controller.$postLink) {
            modal.controller.$postLink.call(modal.controller);
          }

          //Resolve open
          modal.openedDeferred.resolve(true);
        })
        .catch(reason => modal.openedDeferred.reject(reason));
    }

    /**
     * Helper to actually close modal after confirmed
     */
    function confirmCloseModal(modalInstance, result, wasDismissed) {

      //Access modal data object
      let modal = modalInstance.$$modal;
      let numModals = $modalStack.numOpen() - 1;

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

      //Remove from stack
      $modalStack.remove(modalInstance);
      if ($modalStack.isEmpty()) {
        $modalOverlay.hide();
      }
      else {
        $modalOverlay.setIndex(baseIndex, numModals);
      }

      //Animate out
      return $animate.leave(modal.element)
        .then(() => {

          //Call controller on destroy now
          if (modal.controller && modal.controller.$onDestroy) {
            modal.controller.$onDestroy.call(modal.controller);
          }

          //Clean up scope
          if (modal.scope) {
            modal.scope.$destroy();
            modal.scope = null;
          }

          //Remove element reference
          modal.element = null;

          //Remove event listeners
          $document[0].removeEventListener('keydown', modal.broadcastEnter);
          if (modal.closeOnEsc) {
            $document[0].removeEventListener('keydown', modal.closeOnEsc);
            modal.closeOnEsc = null;
          }
        });
    }

    /**
     * Helper to close a modal
     */
    function closeModal(modalInstance, result, wasDismissed) {

      //Access modal data object
      let modal = modalInstance.$$modal;

      //No element present?
      if (!modal.element) {
        return $q.when(true);
      }

      //Call on before close handler if given
      if (typeof modal.onBeforeClose === 'function') {

        //Get outcome
        let outcome = modal.onBeforeClose(modalInstance, result, wasDismissed);

        //Handle promise
        if (outcome && typeof outcome.then === 'function') {
          return outcome
            .then(() => confirmCloseModal(modalInstance, result, wasDismissed))
            .catch(reason => $q.reject(reason || 'Close prevented'));
        }

        //Handle other reject reasons
        if (typeof outcome !== 'undefined' && outcome !== true) {
          return $q.reject(outcome || 'Close prevented');
        }
      }

      //Confirm
      return confirmCloseModal(modalInstance, result, wasDismissed);
    }

    /**
     * Class definition
     */
    let Modal = {

      /**
       * Open a new modal
       */
      open(name, options, closeOthers) {

        //No name given?
        if (typeof name !== 'string') {
          options = name || {};
          name = '';
        }

        //Name given? Merge with predefined configs
        if (name && typeof configs[name] !== 'undefined') {
          options = angular.extend({}, configs[name], options || {});
        }
        else if (name) {
          throw new Error('String given as options, but config with name ' +
            name + ' was not predefined');
        }

        //Check if already open
        if (name && options.once && $modalStack.isOpen(name)) {
          return null;
        }

        //Validate options
        options = angular.extend({}, defaults, options || {});
        options.resolve = options.resolve || {};
        options.appendTo = options.appendTo || bodyElement;

        //Must have either template or template url specified
        if (!options.template && !options.templateUrl) {
          throw new Error('One of template or templateUrl options is required');
        }

        if (!options.appendTo.length) {
          throw new Error('Element to append modal to not found in the DOM');
        }

        //Prepare modal data object
        let modal = {
          openedDeferred: $q.defer(),
          resultDeferred: $q.defer(),
          parent: options.appendTo,
          wrapperClass: options.wrapperClass,
          overlayClass: options.overlayClass,
          showOverlay: options.overlay,
          closeOnClick: options.closeOnClick,
          onBeforeClose: options.onBeforeClose,
        };

        //Create modal instance interface
        let modalInstance = {
          $$modal: modal,
          name,
          opened: modal.openedDeferred.promise,
          result: modal.resultDeferred.promise,
          close(result) {
            return closeModal(modalInstance, result);
          },
          dismiss(reason) {
            return closeModal(modalInstance, reason, true);
          },
        };

        //Close on escape?
        if (options.closeOnEsc) {
          modal.closeOnEsc = function(event) {
            let key = event.keyCode || event.which;
            if (key === 27 && (!name || $modalStack.isLast(name))) {
              $rootScope.$apply(() => {
                closeModal(modalInstance, 'cancel', true);
              });
            }
          };
          $document[0].addEventListener('keydown', modal.closeOnEsc);
        }

        //Enter broadcast
        modal.broadcastEnter = function(event) {
          let key = event.keyCode || event.which;
          let isTextarea = (event.target.tagName === 'TEXTAREA');
          if (key === 13 && !event.defaultPrevented && !isTextarea) {
            $rootScope.$broadcast('$modalEnterKey', modalInstance, event);
          }
        };
        $document[0].addEventListener('keydown', modal.broadcastEnter);

        //Wait for template and resolves to resolve
        $q.all([
          getTemplatePromise(options.template, options.templateUrl),
          ...getResolvePromises(options.resolve),
        ])
          .then(resolves => {

            //Get template content
            modal.content = resolves.shift();

            //Determine modal scope and link close/dismiss handlers
            modal.scope = (options.scope || $rootScope).$new();
            modal.scope.$close = modalInstance.close;
            modal.scope.$dismiss = modalInstance.dismiss;

            //Controller given?
            if (options.controller) {

              //Initialize controller vars
              let locals = {};

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

              //Attach locals to controller
              angular.forEach(options.locals, (value, key) => {
                modal.controller[key] = value;
              });
            }

            //Close others?
            if (closeOthers) {
              Modal.closeAll();
            }

            //Open modal now
            openModal(modalInstance);
          })
          .catch(reason => {
            modal.openedDeferred.reject(reason);
            modal.resultDeferred.reject(reason);
          });

        //Return modal instance
        return modalInstance;
      },

      /**
       * Close all modals
       */
      closeAll() {
        let stack = $modalStack.get();
        angular.forEach(stack, function(modalInstance) {
          closeModal(modalInstance, 'cancel', true);
        });
      },

      /**
       * Check if a specific modal is open
       */
      isOpen(name) {
        return $modalStack.isOpen(name);
      },
    };

    //Return the service
    return Modal;
  };
});
