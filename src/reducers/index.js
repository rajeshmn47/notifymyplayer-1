import { combineReducers } from 'redux';
import { userLoadReducer, userLoginReducer } from './userReducer';

const rootReducer = combineReducers({
  userLogin: userLoginReducer,
  user: userLoadReducer
});

export default rootReducer;
