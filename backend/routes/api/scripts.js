const express = require('express');
const braintree = require('braintree');
const router = express.Router();
const axios = require("axios");
const AWS = require('aws-sdk')
require('dotenv').config();

// Load Script model
const Script = require("../../models/Scripts");
const Mylibrary = require("../../models/Mylibrary")
const Replicate = require('replicate');


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: 'qhq7x84kzdv75tw7',
  publicKey: 'njjfz8799tfh6ctj',
  privateKey: '561b12bc4e9b8fe05c4521732c559c5a'
  // merchantId: 'k94tkn8ndmc3sxbd',
  // publicKey: 'ssj4y6nb6qvmyrxh',
  // privateKey: 'fa7cdf95e5d84423083b848f7079ee90'
});

// OpenAIApi Migration
const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

router.post('/text-image', async (req, res) => {

  const body = {
    version: process.env.TTL_AI_MODEL_VERSION,
    input: req.body,
  };

  const headers = {
    Authorization: `Token ${process.env.TOKEN_API_KEY}`,
    "Content-Type": "application/json",
    "User-Agent": `scribble-node/1.0.0`,
  };

  try {
      const response = await axios.post(process.env.BASE_REPLICATE_URL, body, {
        headers: headers,
      });

      res.json({ imageID: response.data.id });

  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
});

router.post('/getImageOutput', async (req, res) => {

  const headers = {
    Authorization: `Token ${process.env.TOKEN_API_KEY}`,
    "Content-Type": "application/json",
  }

  try {
    const response = await axios.get(`${process.env.BASE_REPLICATE_URL}/${req.body.id}`, {
        headers: headers
    });

    console.log(response.data)

    if (response.data.status == 'succeeded'){
      
      const s3bucket = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
      });

      const raw = await axios.get(response.data.output[0], {
          responseType: "arraybuffer"
      })

      let base64 = raw.data.toString("base64")
      var buf = Buffer.from(base64, 'base64')
      let ts = Date.now();
      let date_time = new Date(ts)
      let date = date_time.getDate()
      let month = date_time.getMonth() + 1;
      let year = date_time.getFullYear();
      const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `TTI/uploads/${year}/${month}/${date}/${ts}_out.png`,
          Body: buf,
          ACL: 'public-read',
          ContentType: `binary/octet-stream`
      }

      const uploadImage = await s3bucket.upload(params).promise();
      res.json({ output: uploadImage.Location, message: response.data.status});
    } else {
      res.json({ output: '', message: response.data.status});
    }

  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
});


router.get('/get_client_token', (req, res) => {
  gateway.clientToken.generate({}, (err, response) => {
    if (err) {
      res.status(500).send('Error generating token');
    } else {
      res.send(response.clientToken);
    }
  });
});

router.post('/process-payment', (req, res) => {  
  const { paymentMethodNonce, amount } = req.body;
  gateway.transaction.sale({
    amount: amount,
    paymentMethodNonce: paymentMethodNonce,
    options: {
      submitForSettlement: true,
    },
  }, (err, result) => {
    if (err) {
      res.status(500).json({ error: err });
    } else if (result.success) {
      res.json({ success: true, transaction: result.transaction });
    } else {
      res.status(500).json({ error: result.errors });
    }
  });
});

router.post('/refund', (req, res) => {
  const { transactionId, amount } = req.body;

  gateway.transaction.refund(transactionId, amount, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (result.success) {
      res.json({ success: true, transaction: result.transaction });
    } else {
      res.status(500).json({ error: result.message });
    }
  });
});

router.post('/void', (req, res) => {
  console.log(req.body)
  const { transactionId } = req.body;

  gateway.transaction.void(transactionId, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (result.success) {
      res.json({ success: true, transaction: result.transaction });
    } else {
      res.status(500).json({ error: result.message });
    }
  });
});

router.get('/check-payment/:transactionId', (req, res) => {
  console.log(req.params)
  const transactionId = req.params.transactionId;

  gateway.transaction.find(transactionId, (err, transaction) => {
    if (err) {
      // Handle errors (e.g., transaction not found or API errors)
      res.status(500).json({ error: err.message });
    } else {
      // Check the transaction status
      switch (transaction.status) {
        case 'submitted_for_settlement':
        case 'settling':
        case 'settled':
          res.json({ success: true, status: transaction.status });
          break;
        default:
          res.json({ success: false, status: transaction.status });
          break;
      }
    }
  });
});

router.post('/save_library', (req, res) => {
  const { user_id, title, style, images, script} = req.body
  const lib = new Mylibrary({
    user_id: user_id,
    title: title,
    style: style,
    images: images,
    script: script,
  });

  lib.save()
    .then(saveLibrary => res.json({ success: true }))
    .catch(err => {
      console.error(err); // Log the error for debugging purposes
      res.status(400).json({ error: 'Unable to add this script' });
    });
});

router.post('/libraries', (req, res) => {
  const { userId } = req.body; // Get the user ID from the request body

  if (!userId) {
    return res.status(400).json({ error: 'No userId provided' });
  }

  // Find all libraries with the given user ID
  Mylibrary.find({ user_id: userId })
    .then(libraries => {
      res.json(libraries); // Send the found libraries in the response
    })
    .catch(err => {
      console.error(err); // Log the error for debugging purposes
      res.status(500).json({ error: 'Error fetching libraries' });
    });
});


// @route GET api/scripts/test
// @description tests scripts route
// @access Public
router.get('/test', (req, res) => res.send('script route testing!'));

// @route GET api/scripts
// @description Get all scripts
// @access Public
router.get('/', (req, res) => {
  Script.find()
    .then(scripts => res.json(scripts))
    .catch(err => res.status(404).json({ noscriptsfound: 'No Scripts found' }));
});

// @route GET api/scripts/:id
// @description Get single script by id
// @access Public
router.get('/:id', (req, res) => {
  Script.findById(req.params.id)
    .then(script => res.json(script))
    .catch(err => res.status(404).json({ noscriptfound: 'No Script found' }));
});

// @route POST api/scripts
// @description add/save script
// @access Public
router.post('/', async (req, res) => {
  const { title, topic, vibe, video_format, time, cta } = req.body.data;

  const prompt = [
    {
      role: 'system',
      content: `
      Please send me the best video script based on video topic: ${topic}, title: ${title}, vibe: ${vibe} and video format: ${video_format}, duration: ${time}. You print each visual's duration time like this style (00:00~00:XX) And at the end of script please add like this word ${cta}
    `,
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: prompt,
  });

  let str = response.choices[0].message.content;

  const script = new Script({
    title: title,
    topic: topic,
    vibe: vibe,
    video_format: video_format,
    script: str,
    time: time,
    cta: cta,
  });

  script.save()
    .then(savedScript => res.json({ str: str }))
    .catch(err => {
      console.error(err); // Log the error for debugging purposes
      res.status(400).json({ error: 'Unable to add this script' });
    });
});


router.post('/getScreenScripts', async (req, res) => {
  try {
    const { script } = req.body.data;

    const prompt = [
      {
        role: 'system',
        content: `
        In this video script ${script}, You have to print only image's descriptions but the descriptions are too short. You have to change each descriptions more specific with around 3 sentences and print them like this JSON style {"screen":"...", "screen":"...", "screen":"...", ...}
      `,
      },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: prompt,
    });

    let str = response.choices[0].message.content;
    res.json({ str: str })
  } catch (err) {
    res.status(400).json({ error: 'Unable to add this script' })
  }
});

router.post('/getVisualList', async (req, res) => {
  try {
    const { script } = req.body.data;
    const prompt = [
      {
        role: 'system',
        content: `
        In this video script ${script}, there are pairs of screen description, duration time of screens and audio part. 
        Please choose screen description and audio part(match with screen description) and print them (pair each one). You have to print all pairs.
      `,
      },
    ];

    const functions = [
      {
        "name": "get_pairs",
        "description": "This function print all pairs of screen description and audio part. It accepts an array of objects. Each object should include screen description and audio part",
        "parameters": {
          type: 'object',
          properties: {
            role_users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  "visual": {
                    "type": 'string',
                    "description": 'screen description',
                  },
                  "audio": {
                    "type": 'string',
                    "description": 'audio part',
                  },
                },
                required: ['visual', 'audio'],
              },
            }
          },
          required: ['role_users'],

        }
      }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: prompt,
      functions: functions,
    });

    let obj = JSON.parse(response.choices[0].message.function_call.arguments)

    let str = obj.role_users;
    const updatedStr = str.map(obj => ({
      ...obj,
      status: "To Review"
    }));
    res.json({ str: updatedStr })
  } catch (err) {
    res.status(400).json({ error: 'Unable to add this script' })
  }
});

// @route GET api/scripts/:id
// @description Update script
// @access Public
router.put('/:id', (req, res) => {
  Script.findByIdAndUpdate(req.params.id, req.body)
    .then(script => res.json({ msg: 'Updated successfully' }))
    .catch(err =>
      res.status(400).json({ error: 'Unable to update the Database' })
    );
});

// @route GET api/scripts/:id
// @description Delete script by id
// @access Public
router.delete('/:id', (req, res) => {
  Script.findByIdAndRemove(req.params.id, req.body)
    .then(script => res.json({ mgs: 'Script entry deleted successfully' }))
    .catch(err => res.status(404).json({ error: 'No such a script' }));
});

module.exports = router;
