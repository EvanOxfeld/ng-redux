import Connector from './connector';
import invariant from 'invariant';
import isFunction from '../utils/isFunction';
import {createStore, applyMiddleware, compose} from 'redux';
import digestMiddleware from './digestMiddleware';

export default function ngReduxProvider() {
  let _reducer = undefined;
  let _middlewares = [];
  let _storeEnhancers = undefined;

  this.createStoreWith = (reducer, middlewares, storeEnhancers) => {
  	  invariant(
        isFunction(reducer),
        'The reducer parameter passed to createStoreWith must be a Function. Instead received %s.',
        typeof reducer
      );

      invariant(
        !storeEnhancers || Array.isArray(storeEnhancers),
        'The storeEnhancers parameter passed to createStoreWith must be an Array. Instead received %s.',
        typeof storeEnhancers
      );

      _reducer = reducer;
      _storeEnhancers = storeEnhancers
      _middlewares = middlewares;
  };

  this.$get = ($injector) => {
  	let store, resolvedMiddleware = [];

  	for(let middleware of _middlewares) {
  		if(typeof middleware === 'string') {
  			resolvedMiddleware.push($injector.get(middleware));
  		} else {
  			resolvedMiddleware.push(middleware);
  		}
  	}

    let finalCreateStore = _storeEnhancers ? compose(..._storeEnhancers, createStore) : createStore;

    resolvedMiddleware.push(digestMiddleware($injector.get('$rootScope')));

    store = applyMiddleware(...resolvedMiddleware)(finalCreateStore)(_reducer);

  	return {
      ...store,
      connect: Connector(store)
    };
  }

  this.$get.$inject = ['$injector'];
}
