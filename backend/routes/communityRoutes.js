const express = require('express');
const {
  getCommunityBootstrap,
  postMessage,
  postReply,
} = require('../controllers/communityController');

const router = express.Router();

router.get('/', getCommunityBootstrap);
router.post('/messages', postMessage);
router.post('/threads/:threadId/replies', postReply);

module.exports = router;
