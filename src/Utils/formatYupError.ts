import { ValidationError } from "yup";

export const formatYuperror = (err: ValidationError) => {
  /* cleaning uo the error object that yup throws and returning
  only path and mesage of the errors */
  const errors: Array<{ path: string; message: string }> = [];

  err.inner.forEach(e => {
    errors.push({
      path: e.path,
      message: e.message
    });
  });

  return errors;
};
