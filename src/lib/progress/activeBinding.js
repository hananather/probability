let current = null;

export const getActiveProgressBinding = () => current;

export function setActiveProgressBinding(binding) {
  current = binding;
  return () => { if (current === binding) current = null; };
}
