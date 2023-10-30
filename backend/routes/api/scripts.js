const express = require('express');
const router = express.Router();
require('dotenv').config();

// Load Script model
const Script = require("../../models/Scripts");

// OpenAIApi Migration
const OpenAI = require('openai');
const openai = new OpenAI(process.env.OPENAI_API_KEY);

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
  const { topic, vibe, video_format, time, cta } = req.body.data;

  const prompt = [
    {
      role: 'system',
      content: `
      Please send me the best video script based on video topic: ${topic}, vibe: ${vibe} and video format: ${video_format}, duration: ${time}. You print each visual's duration time like this style (00:00~00:XX) And at the end of script please add like this word ${cta}
    `,
    },
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: prompt,
  });

  let str = response.choices[0].message.content;

  req.body.script = str;

  Script.create(req.body)
    .then(script => res.json({ str: str }))
    .catch(err => res.status(400).json({ error: 'Unable to add this script' }));
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
    res.json({ str: str })
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
