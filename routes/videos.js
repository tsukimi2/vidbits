const router = require('express').Router()
const Video = require('../models/video')
const ObjectId = require('mongoose').Types.ObjectId


router.get('/', async(req, res, next) => {
  const videos = await Video.find()

  res.render('videos/index', { videos: videos })
})

router.get('/videos/create', (req, res, next) => {
  res.render('videos/create')
})

router.get('/videos/:id/edit', async (req, res, next) => {
  try {
    const video = await Video.findOne({ _id: req.params.id })
    res.render('videos/edit', { video: video })
  } catch(err) {
    return res.status(500).send(err)
  }
})

router.get('/videos/:id', async (req, res, next) => {
  let video = null
 
  Video.find({ _id: req.params.id}, function(err, video) {
    if(err) {
      video = {}
    } else {
      video = video[0]
    }

    res.render('videos/show', { video: video })
  })
})

router.post('/videos/:id/updates', async (req, res, next) => {
  let old_video = null
  let video = null

  try {
    old_video = await Video.findOne({ _id: req.params.id })
        .catch(function(err2) {
          console.log('err2')
          console.log(err2)
        })     
    video = await Video.findOneAndUpdate({
      _id: req.params.id},
      req.body,
      {
        new: true,
        runValidators: true
      }
    )

    if(!video) {
      res.status(404)
    } else {   
      res.status(302)
    }
 
    res.render('videos/show', { video: video })
  } catch(err) {    
    if (err.name === 'MongoError' && err.code === 11000) {
      res.status(409).render(err)
    } else if(err.errors) {  
      res.status(400).render('videos/edit', { errobj: err.errors, video: old_video })
    } else {
      res.status(500).send(err)
    }
  }
})

router.post('/videos/:id/deletions', async (req, res, next) => {
  try {
    const video = await Video.findOneAndRemove({ _id: req.params.id })
    
    if(!video) {
      res.status(404).send(err)
    } else {
      const video_list = await Video.find()
  
      res.status(200).render('videos/index', { videos: video_list })
    }
  } catch(err) {
    return res.status(500).send(err)
  }
})

router.post('/videos', async (req, res, next) => {
  const {title, videoUrl, description} = req.body;

  let err = false
 
  const newVideo = new Video({
    title: title,
    videoUrl: videoUrl,
    description: description
  })

  newVideo.save((err) => {
    if(err) {
      if(err.errors) {
        res.status(400).render('videos/create', { errobj: err.errors, video: newVideo })
      
      }
    } else {
      Video.find(function(err, videos) {
        res.status(302).render('videos/show', { video: newVideo })
      })
    }
  })
})


module.exports = router