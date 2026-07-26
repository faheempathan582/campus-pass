const ALLOWED_DOMAIN = '@srit.ac.in';

function isValidCollegeEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return email.trim().toLowerCase().endsWith(ALLOWED_DOMAIN);
}

module.exports = { isValidCollegeEmail, ALLOWED_DOMAIN };
