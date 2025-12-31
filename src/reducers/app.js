import * as types from './types'
import { checkAuth } from '../utils/helper'

const initialState = {
  user_profile: {},
  auth: checkAuth() || {},
  user_local_config: { sidebarBehavior: false, sidebar: true },
  pageHeading: {
    title: '',
    subtitle: ''
  }
}

const appState = (state = initialState, action) => {

  if (!types[action.type]) {
    return state;
  }

  const type = action.type.toLowerCase();
  switch (type) {
    case 'auth':
      return {
        ...state,
        auth: action.payLoad?.data,
        user_profile: action.payLoad?.data
      }
    case 'update_profile':
      return {
        ...state,
        user_profile: {
          ...state.user_profile,
          ...action.payLoad
        }
      }
    case 'user_local_config':
      return {
        ...state,
        user_local_config: action.payLoad
      }
    case 'page_heading':
      return {
        ...state,
        pageHeading: action.payLoad
      }
    default:
      return {
        ...state,
        [type]: action.payLoad
      }
  }
}

export default appState;