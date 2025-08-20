import { createStore, applyMiddleware, compose } from 'redux'
import { thunk } from 'redux-thunk';
import { createLogger } from 'redux-logger'
import allReducers from '../reducers';
import promise from 'redux-promise';

const composeEnhancers = process.env.NODE_ENV === 'development'
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
  : compose;

// const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
const logger = createLogger();

export default function configureStore(initialState) {
  return createStore(
    allReducers,
    initialState,
    // composeEnhancers(applyMiddleware(thunk, logger, promise))
    composeEnhancers(applyMiddleware(thunk, promise))
  );
}
