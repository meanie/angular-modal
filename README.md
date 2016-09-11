# meanie-angular-modal

[![npm version](https://img.shields.io/npm/v/meanie-angular-modal.svg)](https://www.npmjs.com/package/meanie-angular-modal)
[![node dependencies](https://david-dm.org/meanie/angular-modal.svg)](https://david-dm.org/meanie/angular-modal)
[![github issues](https://img.shields.io/github/issues/meanie/angular-modal.svg)](https://github.com/meanie/angular-modal/issues)
[![codacy](https://img.shields.io/codacy/51a759324f3f4fd69de66047696bc18b.svg)](https://www.codacy.com/app/meanie/angular-modal)
[![Join the chat at https://gitter.im/meanie/meanie](https://img.shields.io/badge/gitter-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/meanie/meanie?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

An Angular service to predefine and display modal dialogs

![Meanie](https://raw.githubusercontent.com/meanie/meanie/master/meanie-logo-full.png)

## Installation

You can install this package using `npm`:

```shell
npm install meanie-angular-modal --save
```

Include the script `node_modules/meanie-angular-modal/release/meanie-angular-modal.js` in your build process, or add it via a `<script>` tag to your `index.html`:

```html
<script src="node_modules/meanie-angular-modal/release/meanie-angular-modal.js"></script>
```

Add `Modal.Service` as a dependency for your app.

## Usage

Open modals which are configured in run time:

```js
angular.module('App.MyModule').controller('MyController', function($modal) {

  //Create modal instance and open modal
  var modalInstance = $modal.open({
    templateUrl: 'modals/myModal.html',
    controller: 'MyModalCtrl'
  });

  //Promise for opened gets resolved when the modal has loaded and opened successfully
  modalInstance.opened.then(function() {
    //modal is open and fully loaded, including resolved dependencies
  });

  //When closed with a result, the result promise gets resolved
  modalInstance.result.then(function(result) {
    //do something with the result
  });

  //Close the modal
  modalInstance.close(result).then(function() {
    //modal is closed with given result
  }).catch(function(reason) {
    //modal close was prevent for the given reason
  });

  //Dismiss the modal
  modalInstance.dismiss(reason).then(function() {
    //modal dismissed with given reason
  }).catch(function(reason) {
    //modal dismissal was prevent for the given reason
  });

  //Close all open modals
  $modal.closeAll();
});
```

Pre-configure modals and open them later:

```js
angular.module('App.MyModule').config(function($modalProvider) {

  //Predefine a named modal
  $modalProvider.modal('myModal', {
    templateUrl: 'modals/myModal.html',
    controller: 'MyModalCtrl'
  });
}).controller('MyController', function($modal) {

  //Open predefined modal from anywhere, passing optional override options
  $modal.open('myModal', {
    locals: {
      someDep: someValue
    }
  });

  //Check if a named modal is open
  if ($modal.isOpen('myModal')) {
    //Modal is currently open
  }
});
```

Listen for enter key event

```js
$scope.$on('$modalEnterKey', function(modalInstance, event) {

  //...do stuff and close modal
  modalInstance.close();
});
```

## Configuration

The following configuration options are available, along with their default values:

```js
let modalOptions = {
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
  wrapperClass: 'modal-wrapper ModalWrapper',
  overlayClass: 'modal-overlay ModalOverlay',
  onBeforeClose: null
};
```

You can use the `onBeforeClose` handler as follows:

```js
onBeforeClose: function(modalInstance, result, wasDismissed) {

  //Return true or nothing at all to allow the modal to be closed.
  return true;

  //Return anything else to prevent closing the modal.
  //The value you return will be used as the reject reason for the
  //promise that is returned by the close() and dismiss() methods.
  return 'Something went wrong';
}
```

## Issues & feature requests

Please report any bugs, issues, suggestions and feature requests in the [meanie-angular-modal issue tracker](https://github.com/meanie/angular-modal/issues).

## Contributing

Pull requests are welcome! If you would like to contribute to Meanie, please check out the [Meanie contributing guidelines](https://github.com/meanie/meanie/blob/master/CONTRIBUTING.md).

## Credits

* Inspired by the modal service of UI Bootstrap.
* Meanie logo designed by [Quan-Lin Sim](mailto:quan.lin.sim+meanie@gmail.com)

## License

(MIT License)

Copyright 2015-2016, [Adam Buczynski](http://adambuczynski.com)
