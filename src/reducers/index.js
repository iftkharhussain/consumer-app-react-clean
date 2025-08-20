import { combineReducers } from 'redux';
import App from './app';

const appReducer = combineReducers({
  app: App
})

const rootReducer = (state, action) => {
  return appReducer(state, action)
}

export default rootReducer