/**
 * FILE: backend/middleware/roleMiddleware.js
 * ROLE: Checks if the logged-in user's role is allowed to access a specific route.
 * USED BY / TALKS TO: Used right after authMiddleware in backend/routes/*.js.
 * KEY IDEA: Authentication = "who are you?"; Authorization = "are you allowed here?".
 */
// Factory function: returns a middleware customized for the allowed roles (e.g. 'admin')
function authorize(...roles) {
  return function checkRole(req, res, next) {
    // SECURITY: Always enforce roles on the server; never trust frontend-only checks
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}

module.exports = { authorize };
