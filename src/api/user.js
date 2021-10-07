import bcrypt from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import User from '../model/user';

export const API_STATE = Object.freeze({
  failed: 'failed',
  success: 'success',
});

export async function create(loginName, password) {
  const hashedPassword = await encryptPassword(password);
  const user = new User({ loginName, password: hashedPassword });
  const result = {
    status: undefined,
    error: undefined,
    userId: undefined,
  };

  try {
    const newUser = await user.save();

    result.success = API_STATE.success;
    result.userId = newUser._id;
  } catch (e) {
    result.status = API_STATE.failed;

    switch (e.code) {
      case 11000: // login name duplication error (login has a unique constrain)
        result.error = `The user '${loginName}' already exists. Have you forgot your password ?`;
        break;
      default:
        result.error = `${e.code} : ${e.message}`;
        break;
    }
  }

  return result;
}

export async function login(loginName, password) {
  const user = await User.findOne({ loginName });
  let loginResult = {
    status: undefined,
    error: undefined,
    token: undefined,
  };

  if (!user) {
    loginResult.status = API_STATE.failed;
    loginResult.error = 'user-name or password are incorrect';
  } else {
    const isPaswwordCorrect = await comparePassword(user.password, password);

    loginResult.status = isPaswwordCorrect ? API_STATE.success : API_STATE.failed;
    loginResult.error = isPaswwordCorrect ? null : 'user-name or password are incorrect';
  }

  if (loginResult.status === API_STATE.success) {
    const token = sign({ uid: user._id }, process.env.TOKEN_SECRET, { expiresIn: '3d' });
    loginResult.token = token;
  }

  return loginResult;
}

export async function updatePassword(userId, oldPassword, newPassword) {
  const result = {
    status: undefined,
    error: undefined,
  };

  let user = null;
  try {
    user = await User.findById(userId, 'password');
  } catch (e) {
    result.status = API_STATE.failed;
    result.error = e.message;
  }

  if (!user) {
    result.status = API_STATE.failed;
    result.error = 'User not found';
  }

  // Check users password from DB againt provided pasword.
  if (!result.status) {
    const isPasswordCorrect = comparePassword(oldPassword, user.password);
    if (!isPasswordCorrect) {
      result.status = API_STATE.failed;
      result.error = 'old pasword is incorrect';
    }
  }

  // check that new-password is different from the old-password
  if (!result.status) {
    if (oldPassword === newPassword) {
      result.status = API_STATE.failed;
      result.error = 'old password and new password are the same. select a different password';
    }
  }

  // check that the new password meets the password-policy rules
  if (!result.status) {
    const { status, error } = checkWithPassswordPolicy(newPassword);
    result.status = status;
    result.error = error;
  }

  // Update password
  if (result.status == API_STATE.success) {
    try {
      const newHashedPassword = await encryptPassword(newPassword);
      user.password = newHashedPassword;
      user.save();
    } catch (e) {
      result.status = API_STATE.failed;
      result.error = e.message;
    }
  }

  return result;
}

export function logout() {
  const result = {
    status: API_STATE.success,
    error: undefined,
    userId: undefined,
  };

  return result;
}

async function encryptPassword(password) {
  const salt = await bcrypt.genSalt();
  const hashedPassword = bcrypt.hash(password, salt);

  return hashedPassword;
}

async function comparePassword(hashedPassword, plainPassword) {
  const result = await bcrypt.compare(plainPassword, hashedPassword);

  return result;
}

function checkWithPassswordPolicy(password) {
  const result = {
    status: undefined,
    error: undefined,
  };

  result.status = API_STATE.success;

  return result;
}

export function authonticate(token) {
  let userId = null;

  if (token) {
    const payload = verify(token, process.env.TOKEN_SECRET);
    userId = payload && payload.uid;
  }

  return userId;
}
