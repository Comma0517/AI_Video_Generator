import {SAVE_ROUTERSTATUS, SAVE_SCRIPTTITLE} from '../actions/routerStatusAction'

const initialState = {
  routerStaus: 0,
  scriptTitle: '',
};

export default function routerStatusReducer(state = initialState, action) {
  switch (action.type) {
    case SAVE_ROUTERSTATUS:
      return { ...state, routerStaus: action.payload };
    case SAVE_SCRIPTTITLE:
      return { ...state, scriptTitle: action.payload };
    default:
      return state;
  }
}