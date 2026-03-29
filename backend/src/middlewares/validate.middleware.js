import { ApiError } from "../utils/ApiError.js";
import { formattedJoiErrors } from "../utils/formattedErrors.js";

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const formattedErrors = formattedJoiErrors(error);
    throw new ApiError(400,"Validation Error", formattedErrors);
  }

  next();
};