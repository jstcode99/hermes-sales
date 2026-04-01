import { isEmpty } from "./object";

export const objectToSearchParams = (obj: Record<string, unknown>) => {
  const params = new URLSearchParams();

  Object.entries(obj)
    .filter(([, v]) => !isEmpty(v))
    .forEach(([k, v]) => params.set(k, String(v)));
  return params;
};
