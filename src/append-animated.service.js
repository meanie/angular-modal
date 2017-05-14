/**
 * Module definition and dependencies
 */
angular.module('AppendAnimated.Service', [])

/**
 * Append animated helper
 */
.factory('$appendAnimated', $animate => {
  return function(child, parent) {
    let children = parent.children();
    if (children.length > 0) {
      return $animate.enter(child, parent, children[children.length - 1]);
    }
    return $animate.enter(child, parent);
  };
});
