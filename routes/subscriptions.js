const express = require('express')
const {
  getChannels,
  getSubscribers,
  createSubscriber,
  checkSubscription,
  getSubscribedVideos
} = require('../controllers/subscriptions')

const Subscription = require('../models/Subscription')

const router = express.Router()

const advancedResults = require('../middleware/advancedResults')
const { protect } = require('../middleware/auth')

router.post('/', protect, createSubscriber)

router.post('/check', protect, checkSubscription)

router.route('/subscribers').get(
  protect,
  advancedResults(Subscription, [{ path: 'subscriberId' }], {
    status: 'private',
    filter: 'channel'
  }),
  getSubscribers
)

router
  .route('/channels')
  .get(
    advancedResults(Subscription, [
      { path: 'channelId', select: 'photoUrl channelName' }
    ]),
    getChannels
  )

router.route('/videos').get(protect, getSubscribedVideos)

module.exports = router
