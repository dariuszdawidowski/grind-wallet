/*** Password helpers ***/


/**
 * Check password with at least 8 characters long and a mix of uppercase and lowercase letters, numbers, and special characters.
 */

export function isPasswordStrong(password) {
  const minLength = 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length >= minLength && hasLowercase && hasUppercase && hasNumber && hasSpecialChar) {
    return true; // Password is strong
  } else {
    return false; // Password is not strong
  }
}
