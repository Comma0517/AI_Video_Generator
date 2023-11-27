export const SAVE_ROUTERSTATUS = 'SAVE_ROUTERSTATUS';
export const SAVE_SCRIPTTITLE = 'SAVE_SCRIPTTITLE';

export function saveRouterStatus(routerStatus) {
  return { type: SAVE_ROUTERSTATUS, payload: routerStatus };
}

export function saveScriptTitle(scriptTitle) {
  return { type: SAVE_SCRIPTTITLE, payload: scriptTitle };
}