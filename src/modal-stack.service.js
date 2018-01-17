
/**
 * Module definition and dependencies
 */
angular.module('ModalStack.Service', [])

/**
 * Modal stack service
 */
.factory('$modalStack', () => {

  //Stack of modals
  const stack = [];

  //Modal stack interface
  return {

    /**
     * Get modal instances stack (copy of the array)
     */
    get() {
      return stack.map(instance => instance);
    },

    /**
     * Check if there are open instances
     */
    isEmpty() {
      return (stack.length === 0);
    },

    /**
     * Get number of modals that are open
     */
    numOpen() {
      return stack.length;
    },

    /**
     * Check if a specific modal is open
     */
    isOpen(name) {

      //Can't distinguish unnamed modals
      if (!name) {
        return false;
      }

      //Check if open
      for (let i = 0; i < stack.length; i++) {
        if (stack[i].name === name) {
          return true;
        }
      }

      //Not open
      return false;
    },

    /**
     * Check if a specific modal is last
     */
    isLast(name) {

      //Can't distinguish unnamed modals or work with an empty stack
      if (!name || stack.length === 0) {
        return false;
      }

      //Get last modal and compare name
      const last = stack[stack.length - 1];
      return (last.name === name);
    },

    /**
     * Add modal instance to stack
     */
    add(modalInstance) {
      stack.push(modalInstance);
    },

    /**
     * Remove modal instance from stack
     */
    remove(modalInstance) {
      const index = stack.indexOf(modalInstance);
      if (index > -1) {
        stack.splice(index, 1);
      }
    },
  };
});
