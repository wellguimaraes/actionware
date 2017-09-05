export type PromiseHandler = {
  resolve(payload: any): void;
  reject(error: Error): void;
}

export type Action = {
  name: string;
  call: (context: any, ...args: any[]) => any;
  bind: (context: any, ...args: any[]) => Function;
  apply: (context: any, args: any[]) => any;
  onError: (error: Error, ...args: any[]) => void;
  onSuccess: (payload: any, ...args: any[]) => void;
  _waiters: Array<PromiseHandler>;
  _trackedAction: TrackedAction;
}

export type TrackedAction = {
  call: (context: any, ...args: any[]) => any;
  bind: (context: any, ...args: any[]) => Function;
  apply: (context: any, args: any[]) => any;
  _successType: string;
  _errorType: string;
  _busyType: string;
  _cancellationType: string;
}

export type ActionData = {
  type: string;
  payload: any;
  trackedAction: TrackedAction;
}

export type Reducer = {
  on(...args: Array<string | Function>): Reducer;
  onError(...args: Array<string | Function>): Reducer;
  before(...args: Array<string | Function>): Reducer;
}

export type Store = {
  dispatch(action: ActionData): void,
  getState(): any
}