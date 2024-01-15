const express = require('express');
const router = express.Router();
const axios = require("axios");
const AWS = require('aws-sdk')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail')
const crypto = require('crypto');
require('dotenv').config();

// Load Script model
const Script = require("../../models/Scripts");
const Mylibrary = require("../../models/Mylibrary")
const User = require('../../models/User');
const Replicate = require('replicate');


sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});


// OpenAIApi Migration
const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// Register User
router.post('/email-verify', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.json({ code: 400, error: 'Passwords do not match' });
  }

  try {
    // Check if user already exists
    let user1 = await User.findOne({ username });
    let user2 = await User.findOne({ email });
    if (user1) {
      return res.json({ code: 400, error: 'UserName already exists' });
    }
    if (user2) {
      return res.json({ code: 400, error: 'UserEmail already exists' });
    }

    let verifyCode = 0;
    verifyCode = Math.floor(100000 + Math.random() * 900000);

    const msg = {
      to: [email], // Change to your recipient
      from: {
        name: 'Applied storyboard.pro',
        email: `${process.env.SENDER_EMAIL}`
      },
      subject: ` Email Verification Code ${verifyCode} `,
      text: 'Your Verify code is below — enter it in your browser.',
      html: '<strong>Your Verify code is below — enter it in your browser.</strong><br><div style="font-size: xx-large; color: blue; text-align: -webkit-center;"><p>' + `${verifyCode}` + '<p/><div/>',
    }

    sgMail
      .send(msg)
      .then((response) => {
        console.log(response[0].statusCode)
        console.log(response[0].headers)
      })
      .catch((error) => {
        console.error(error)
      })

    res.json({ verifyCode: verifyCode });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.post('/register', async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Check if passwords match
  if (password !== confirmPassword) {
    return res.json({ code: 400, error: 'Passwords do not match' });
  }

  try {
    // Check if user already exists
    let user1 = await User.findOne({ username });
    let user2 = await User.findOne({ email });
    if (user1) {
      return res.json({ code: 400, error: 'UserName already exists' });
    }
    if (user2) {
      return res.json({ code: 400, error: 'UserEmail already exists' });
    }

    // Create a new user
    let user = new User({
      username,
      email,
      password,
    });

    // Save the user
    await user.save();

    // Create a token
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token: token, user_id: payload.user.id, username: user.username});
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email, baseUrl} = req.body;

  try {
    // Check for user
    let user = await User.findOne({ email });
    if (!user) {
      return res.json({ code: 400, error: 'User not found.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    const resetURL = `${baseUrl}/reset-password/${resetToken}`;

    console.log(resetURL)

    const msg = {
      to: [email], // Change to your recipient
      from: {
        name: 'Applied storyboard.pro',
        email: `${process.env.SENDER_EMAIL}`
      },
      subject: ` Reset your password. `,
      text: 'Please click on the following link, or paste this into your browser',
      html: '<strong>You are receiving this email because you have requested the reset of a password. Please click on the following link, or paste this into your browser to complete the process.</strong><br><div style="font-size: large; color: blue; text-align: -webkit-center;"><p>' + `${resetURL}` + '<p/><div/>',
    }

    sgMail
      .send(msg)
      .then((response) => {
        console.log(response[0].statusCode)
        console.log(response[0].headers)
      })
      .catch((error) => {
        console.error(error)
      })

      res.json({ code: 200 });
  } catch (err) {
    let user = await User.findOne({ email });
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Hash the token from the URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by the hashed token and check if token has not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send('Token is invalid or has expired.');
    }

    // Set the new password and clear the reset token fields
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).send('Password has been reset.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Could not reset password.');
  }  
});

// Login User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user
    let user = await User.findOne({ email });
    if (!user) {
      return res.json({ code: 400, error: 'Invalid Credentials' });
    }

    // Check the password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.json({ code: 400, error: 'Password is incorrect' });
    }

    // Create a token
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token: token, user_id: payload.user.id, username: user.username });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

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

    if (response.data.status == 'succeeded') {

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
      res.json({ output: uploadImage.Location, message: response.data.status });
    } else {
      res.json({ output: '', message: response.data.status });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.', details: error.message });
  }
});

router.post('/save_library', (req, res) => {
  const { user_id, title, style, images, script } = req.body
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
