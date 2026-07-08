/* eslint-disable */
import { configureStore, combineReducers } from '@reduxjs/toolkit';

import formReducer from './slices/formSlice';
import navigationReducer from './slices/navigationSlice';

// Combine reducers. (redux-persist is intentionally not wired — this funnel is
// session-only; the source app kept it behind a disabled flag.)
const rootReducer = combineReducers({
    form: formReducer,
    navigation: navigationReducer,
});

// Configure store
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
    devTools: (process.env.NODE_ENV !== 'production'),
});

// Kept as a null export for API compatibility with anything referencing a persistor.
export const persistor = null;
