import { Router } from 'express';
import { API_STATE } from '../api/consts';
import * as userDetailsApi from '../api/userDetails';
import { authonticate } from './user';

const router = Router();

router.post('/', authonticate, getUserDetails);
router.post('/update', authonticate, updateUserDetails);

async function getUserDetails(req, res) {
  const userId = req.params.currentUserId;
  const result = {
    status: undefined,
    error: undefined,
    data: undefined,
  };

  if (userId) {
    try {
      const details = userDetailsApi.getUserDetails(userId);

      result.status = API_STATE.success;
      result.data = details;
    } catch (e) {
      result.status = API_STATE.failed;
      result.error = e.message;
      res.status(500);
    }
  } else {
    result.status = API_STATE.failed;
    result.error = 'No user found. please log-in';

    res.status(400);
  }

  res.json(result);
}

async function updateUserDetails(req, res) {
  const userId = req.params.currentUserId;
  const details = req.body;
  let result = {
    status: undefined,
    error: undefined,
    data: undefined,
  };

  try {
    result = await userDetailsApi.updateUserDetails(userId, details);
  } catch (e) {
    result.status = API_STATE.failed;
    result.error = e.message;
    res.status(500);
  }

  res.json(result);
}

export default router;
