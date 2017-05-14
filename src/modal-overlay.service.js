
/**
 * Module definition and dependencies
 */
angular.module('ModalOverlay.Service', [
  'AppendAnimated.Service',
])

/**
 * Modal overlay service
 */
.factory('$modalOverlay', ($animate, $document, $appendAnimated) => {

  //Global overlay element
  let overlayElement;
  let bodyElement = $document.find('body').eq(0);

  /**
   * Modal overlay service
   */
  return {

    /**
     * Show overlay element
     */
    show(overlayClass) {

      //Already visible?
      if (overlayElement) {
        return;
      }

      //Create element
      overlayElement = angular.element('<div></div>').attr({
        class: overlayClass,
      });

      //Animate in
      return $appendAnimated(overlayElement, bodyElement);
    },

    /**
     * Hide overlay element
     */
    hide() {
      if (overlayElement) {
        $animate.leave(overlayElement);
        overlayElement = null;
      }
    },

    /**
     * Set the proper z-index
     */
    setIndex(baseIndex, numModals) {
      if (overlayElement) {
        const zIndex = baseIndex + 2 * (numModals - 1);
        overlayElement[0].style.zIndex = zIndex;
      }
    },
  };
});
