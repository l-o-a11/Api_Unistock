const ok = (res, data) => res.status(200).json({ success: true, data });
const created = (res, data) => res.status(201).json({ success: true, data });
const noContent = (res) => res.status(204).send();
const badRequest = (res, msg, errors) =>
  res
    .status(400)
    .json({ success: false, message: msg, ...(errors && { errors }) });
const unauthorized = (res, msg = "No autorizado") =>
  res.status(401).json({ success: false, message: msg });
const forbidden = (res, msg = "Acceso denegado") =>
  res.status(403).json({ success: false, message: msg });
const notFound = (res, msg = "No encontrado") =>
  res.status(404).json({ success: false, message: msg });
const conflict = (res, msg) =>
  res.status(409).json({ success: false, message: msg });
const unprocessable = (res, msg) =>
  res.status(422).json({ success: false, message: msg });
const serverError = (res, msg = "Error interno") =>
  res.status(500).json({ success: false, message: msg });

module.exports = {
  ok,
  created,
  noContent,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  unprocessable,
  serverError,
};