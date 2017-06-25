export interface PromiseHandler {
  resolve(payload: any): void;
  reject(error: Error): void;
}

export interface Action extends Function {
  onError: (error: Error, ...args: any[]) => void;
  onSuccess: (payload: any, ...args: any[]) => void;
  _waiters: Array<PromiseHandler>;
  _trackedAction: TrackedAction;
  _successListeners
}

export interface TrackedAction extends Function {
  (...args: any[]): any,
  _wrappedAction: Action;
  _successType: string;
  _errorType: string;
  _busyType: string;
}

export interface ActionData {
  type: string;
  payload: any;
  trackedAction: TrackedAction;
}

export interface Reducer<S> extends Function {
  (state: any, action: any): S;
  on(...args: Array<string | Function>): Reducer<S>;
  onError(...args: Array<string | Function>): Reducer<S>;
  onBusy(...args: Array<string | Function>): Reducer<S>;
}

export interface Store<S> {
  dispatch(action: ActionData): void,
  getState(): S
}