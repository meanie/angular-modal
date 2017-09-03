# @meanie/angular-modal

[![npm version](https://img.shields.io/npm/v/@meanie/angular-modal.svg)](https://www.npmjs.com/package/@meanie/angular-modal)
[![node dependencies](https://david-dm.org/meanie/angular-modal.svg)](https://david-dm.org/meanie/angular-modal)
[![github issues](https://img.shields.io/github/issues/meanie/angular-modal.svg)](https://github.com/meanie/angular-modal/issues)
[![codacy](https://img.shields.io/codacy/51a759324f3f4fd69de66047696bc18b.svg)](https://www.codacy.com/app/meanie/angular-modal)


An Angular service to predefine and display modal dialogs

![Meanie](https://raw.githubusercontent.com/meanie/meanie/master/meanie-logo-full.png)

## Installation

You can install this package using `yarn` or `npm`:

```shell
#yarn
yarn add @meanie/angular-modal

#npm
npm install @meanie/angular-modal --save
```

Include the script `node_modules/@meanie/angular-modal/release/angular-modal.js` in your build process, or add it via a `<script>` tag to your `index.html`:

```html
<script src="node_modules/@meanie/angular-modal/release/angular-modal.js"></script>
```

Add `Modal.Service` as a dependency for your app.

## Usage

Open modals which are configured in run time:

```js
angular.module('App.MyModule').controller('MyController', function($modal) {

  //Create modal instance and open modal
  const modalInstance = $modal.open({
    templateUrl: 'modals/myModal.html',
    controller: 'MyModalCtrl',
  });

  //Create modal instance and open modal, closing any other open modals
  const modalInstance = $modal.open({
    templateUrl: 'modals/myModal.html',
    controller: 'MyModalCtrl',
  }, true);

  //Promise for opened gets resolved when the modal has loaded and opened successfully
  modalInstance
    .opened
    .then(() => {
      //modal is open and fully loaded, including resolved dependencies
    });

  //When dismissed, the closed promise is resolved with a dismissal reason
  modalInstance
    .closed
    .then(reason => {
      //modal was closed due to given reason
    });

  //When closed with a result, the result promise is resolved with the result
  modalInstance
    .result
    .then(result => {
      //modal was closed with given result
    });

  //Resolve the modal with a given result
  modalInstance
    .resolve(result)
    .then(result => {
      //modal was closed with given result
    })
    .catch(reason => {
      //modal close was prevented for the given reason
    });

  //Close the modal without result
  modalInstance
    .close(reason)
    .then(reason => {
      //modal dismissed with given reason
    })
    .catch(reason => {
      //modal dismissal was prevented for the given reason
    });

  //Close all open modals
  $modal.closeAll();

  //Reject the result if modal is dismissed/closed
  const modalInstance = $modal.open({
    templateUrl: 'modals/myModal.html',
    controller: 'MyModalCtrl',
    rejectOnDismissal: true,
  });

  //Then, when closed or dismissed, the result promise is rejected
  modalInstance
    .result
    .catch(reason => {
      //modal was closed due to given reason
    });
});
```

Pre-configure modals and open them later:

```js
angular.module('App.MyModule').config(function($modalProvider) {

  //Predefine a named modal
  $modalProvider.modal('myModal', {
    templateUrl: 'modals/myModal.html',
    controller: 'MyModalCtrl',
  });
}).controller('MyController', function($modal) {

  //Open predefined modal from anywhere, passing optional override options
  $modal.open('myModal', {
    locals: {
      someDep: someValue,
    },
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
const modalOptions = {
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
  onBeforeClose: null
};
```

You can use the `onBeforeClose` handler as follows:

```js
onBeforeClose: function(modalInstance, result, wasDismissed) {

  //Return true or nothing at all to allow the modal to be closed.
  return true;

  //Return a promise to allow the modal to be closed after it resolves.
  return $q.resolve();

  //Return a promise that rejects to prevent the modal from closing.
  return $q.reject('Something went wrong');

  //Return anything else to prevent closing the modal.
  //The value you return will be used as the reject reason for the
  //promise that is returned by the close() and dismiss() methods.
  return 'Something went wrong';
}
```

## Issues & feature requests

Please report any bugs, issues, suggestions and feature requests in the [@meanie/angular-modal issue tracker](https://github.com/meanie/angular-modal/issues).

## Contributing

Pull requests are welcome! If you would like to contribute to Meanie, please check out the [Meanie contributing guidelines](https://github.com/meanie/meanie/blob/master/CONTRIBUTING.md).

## Credits

* Inspired by the modal service of UI Bootstrap.
* Meanie logo designed by [Quan-Lin Sim](mailto:quan.lin.sim+meanie@gmail.com)

## License

(MIT License)

Copyright 2015-2017, [Adam Reis](https://adam.reis.nz)
