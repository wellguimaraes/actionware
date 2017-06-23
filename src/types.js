export type Action = {
  name: string;
  apply: Function;
  call: Function;
  onError: (error: Error, ...args: any[]) => void;
  onSuccess: (payload: any, ...args: any[]) => void;
  _waiters: Array<Promise>;
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