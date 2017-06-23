export type Action = {
  name: string;
  onError: (error: Error, ...args: any[]) => void;
  onSuccess: (payload: any, ...args: any[]) => void;
  apply: Function;
  call: Function;
  _waiters: Array<{ resolve, reject }>
  _trackedAction: TrackedAction;
}

export type TrackedAction = {
  _wrappedAction: Action;
  _successType: string;
  _errorType: string;
  _loadingType: string;
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