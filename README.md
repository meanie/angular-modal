# meanie-angular-modal

[![npm version](https://img.shields.io/npm/v/meanie-angular-modal.svg)](https://www.npmjs.com/package/meanie-angular-modal)
[![node dependencies](https://david-dm.org/meanie/angular-modal.svg)](https://david-dm.org/meanie/angular-modal)
[![github issues](https://img.shields.io/github/issues/meanie/angular-modal.svg)](https://github.com/meanie/angular-modal/issues)
[![codacy](https://img.shields.io/codacy/4e1e3e31e0ed44759bea0cac8ef22d76.svg)](https://www.codacy.com/app/meanie/angular-modal)
[![Join the chat at https://gitter.im/meanie/meanie](https://img.shields.io/badge/gitter-join%20chat%20%E2%86%92-brightgreen.svg)](https://gitter.im/meanie/meanie?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

AngularJS module to provide a simple but flexible modal service

## Installation

You can install this package using `meanie`, `npm` or `bower`.

### meanie

```shell
meanie install angular-modal
```

Then add `Modal.Service` as a dependency for your app:

```js
angular.module('App.MyModule', ['Modal.Service']);
```

### npm

```shell
npm install meanie-angular-modal
```

Then add as a dependency for your app:

```js
angular.module('App.MyModule', [require('meanie-angular-modal')]);
```

### bower

```shell
bower install meanie-angular-modal
```

Add a `<script>` to your `index.html`:

```html
<script src="/bower_components/meanie-angular-modal/release/meanie-angular-modal.js"></script>
```

Then add `Modal.Service` as a dependency for your app:

```js
angular.module('App.MyModule', ['Modal.Service']);
```

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
  });

  //Dismiss the modal
  modalInstance.dismiss(reason).then(function() {
    //modal dismissed with given reason
  });
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
});
```

## Configuration

The following configuration options are available, along with their default values:

```js
var modalOptions = {
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
```

## Issues & feature requests

Please report any bugs, issues, suggestions and feature requests in the [meanie-angular-modal issue tracker](https://github.com/meanie/angular-modal/issues).

## Contributing

Pull requests are welcome! Please create them against the [dev branch](https://github.com/meanie/angular-modal/tree/dev) of the repository.

If you would like to contribute to Meanie, please check out the [Meanie contributing guidelines](https://github.com/meanie/meanie/blob/master/CONTRIBUTING.md).

## License

(MIT License)

Copyright 2015, [Adam Buczynski](http://adambuczynski.com)
