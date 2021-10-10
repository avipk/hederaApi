import { Router } from 'express';
import { verify } from 'jsonwebtoken';
import * as userApi from '../api/user';
import { API_STATE, TOKEN_COOKIE_KEY } from '../api/consts';

const router = Router();

router.post('/create', create);
router.post('/login', login);
router.post('/updatePassword', authonticate, updatePassword);
router.post('/logout', logout);

async function create(req, res) {
  const { userName, password } = req.body;
  const result = await userApi.create(userName, password);

  return res.json(result);
}

async function login(req, res) {
  const { token } = req.cookies;
  let result = null;
  let isAlreadyLoggedIn = true;

  try {
    isAlreadyLoggedIn = token && !!userApi.authonticate(token);
  } catch (e) {
    // a malformed token was provided. remove it.
    res.clearCookie(TOKEN_COOKIE_KEY);
  }

  if (!isAlreadyLoggedIn) {
    const { userName, password } = req.body;
    result = await userApi.login(userName, password);
  } else {
    res.status(400).json({
      status: API_STATE.failed,
      error: 'A user already logged-in',
    });
  }

  if (result.status === API_STATE.success) {
    res.cookie(TOKEN_COOKIE_KEY, result.token, { httpOnly: true });
  }

  res.json(result);
}

async function updatePassword(req, res) {
  const userId = req.params.currentUserId;
  const { oldPassword, newPassword } = req.body;
  const result = await userApi.updatePassword(userId, oldPassword, newPassword);

  return res.json(result);
}

async function logout(req, res) {
  res.clearCookie(TOKEN_COOKIE_KEY, null);
  res.json(userApi.logout());
}

export function authonticate(req, res, next) {
  const { token } = req.cookies;
  let userId = userApi.authonticate(token);

  if (!!userId) {
    req.params.currentUserId = userId;
    next();
  } else {
    res.status(403).json({
      status: API_STATE.failed,
      error: 'Autontication failed',
    });
  }
}

export default router;
