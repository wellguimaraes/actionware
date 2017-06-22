export type Action = {
  name: string;
  onError: (error: Error, ...args: any[]) => void;
  onSuccess: (payload: any, ...args: any[]) => void;
  _trackedAction: TrackedAction;
  _successType: string;
  _errorType: string;
  _loadingType: string;
  apply: Function;
  call: Function;
}

export type TrackedAction = {
  _wrappedAction: Action
}

export type ReduxAction = {
  type: string;
  payload: any;
  action: Action;
}

export type ReduxStore = {
  dispatch: (action: ReduxAction) => void;
  getState: () => any;
}