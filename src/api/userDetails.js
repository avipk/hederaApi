import UserDetails from '../model/userDetails';
import { API_STATE } from './consts';

export async function getUserDetails(userId) {
  const userDetails = await UserDetails.findById(userId);

  return userDetails;
}

export async function updateUserDetails(userId, details) {
  const result = {
    status: undefined,
    error: undefined,
    data: undefined,
  };

  if (details) {
    try {
      const updatedDetails = await UserDetails.updateOne({ _id: userId }, details, {
        upsert: true,
        new: true,
      });

      result.status = API_STATE.success;
      result.data = updatedDetails;
    } catch (e) {
      result.status = API_STATE.failed;
      result.error = e.message;
    }
  }

  return result;
}

function validateUserDetails(details) {
  const { firstName, lastName, email, address, phone, idNumber } = details;

  if (firstName) validateName(firstName);

  validateName(lastName);

  validateEmail(email);

  validateAddress(address);

  validatePhone(phone);

  validateIdNumber(idNumber);
}

function isEmpty(str) {
  const asString = String(str);
  return !(str && str.trim().length > 0);
}

/**
 * Validate a name for containg valid characters only.
 * A valid name: string with minimum length of 2 charecter, any letter-charecter(unicode), dash and space
 * @param {String} name
 */
function validateName(name) {
  const rx = /^[\p{L}\-\s]{2,}$/u;

  return name && rx.test(name);
}

/**
 * Validate for legal email address
 * @param {String} email
 */
function validateEmail(email) {
  const rx =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

  return email && rx.test(email);
}

/**
 * Valid adress:
 *   min-length: 4 char
 *   any letter(unicode),
 *   numbers,
 *   dash,
 *   space,
 *   comma,
 *   semicolon,
 *   back-slash,
 *   forward-slash,
 * @param {String} address
 */
function validateAddress(address) {
  const rx = /^[\p{L}0-9\-\s,;\\\/]{4,}$/;

  return address && rx.test(address);
}

/**
 * Validate phone number: +<contry-code>-<prefix>-<number>
 * country code is optional, must followed by a '+' sign if exists.
 * @param {String} phone
 */
function validatePhone(phone) {
  const rx = /^(\+[0-9-]{1,5}[\s-]?)?([0-9]{1,3}[\s-]?)([0-9]{7})$/;

  return phone && rx.test(phone);
}

/**
 * Validates Israeli I.D number
 * @param {String} idNumber
 */
function validateIdNumber(idNumber) {
  idNumber = String(idNumber).trim();
  if (idNumber.length > 9 || isNaN(idNumber)) {
    return false;
  }

  idNumber = idNumber.length < 9 ? ('00000000' + idNumber).slice(-9) : idNumber;

  const result = Array.from(id, Number).reduce((counter, digit, i) => {
    const step = digit * ((i % 2) + 1);
    return counter + (step > 9 ? step - 9 : step);
  });

  return result % 10 === 0;
}
