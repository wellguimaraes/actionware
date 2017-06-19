let actionState = {};

export const getActionState = () => actionState;

export function setActionState(newState) {
  actionState = newState;
}