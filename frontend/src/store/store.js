import { createStore } from 'redux';
import routerStatusReducer from './reducers/routerStatusReducer';

const store = createStore(routerStatusReducer);

export default store;