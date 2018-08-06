const express = require('express');
const router = express.Router();

const CRNOMELJ_SLO_URL = 'https://api.messengerbot.si/visit-dolenjska/webviews/weather-crnomelj-slo/show';
const NOVO_MESTO_SLO_URL = 'https://api.messengerbot.si/visit-dolenjska/webviews/weather-novo-mesto-slo/show';
const KOCEVJE_SLO_URL = 'https://api.messengerbot.si/visit-dolenjska/webviews/weather-kocevje-slo/show';

const CRNOMELJ_ENG_URL = 'https://api.messengerbot.si/visit-dolenjska/webviews/weather-crnomelj-eng/show';
const NOVO_MESTO_ENG_URL = 'https://api.messengerbot.si/visit-dolenjska/webviews/weather-novo-mesto-eng/show';
const KOCEVJE_ENG_URL = 'https://api.messengerbot.si/visit-dolenjska/webviews/weather-kocevje-eng/show';

const createButtons = (displayUrl) => {
  return {
    messages:[
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            image_aspect_ratio: 'square',
            elements: [{
              title: 'Welcome!',
              subtitle: 'Choose your preferences',
              buttons:[
                {
                  type: 'web_url',
                  url: displayUrl,
                  title: 'Webview (compact)',
                  messenger_extensions: true,
                  webview_height_ratio: 'compact' // Small view
                },
                {
                  type: 'web_url',
                  url: displayUrl,
                  title: 'Webview (tall)',
                  messenger_extensions: true,
                  webview_height_ratio: 'tall' // Medium view
                },
                {
                  type: 'web_url',
                  url: displayUrl,
                  title: 'Webview (full)',
                  messenger_extensions: true,
                  webview_height_ratio: 'full' // large view
                }
              ]
            }]
          }
        }
      }
  ]};
};

const createQuizButtonSlo = (displayUrl) => {
  return {
    messages:[
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            image_aspect_ratio: 'square',
            elements: [{
              title: 'Kakšen tip popotnika si?',
              subtitle: '',
              buttons:[
                {
                  type: 'web_url',
                  url: displayUrl,
                  title: 'Začni tukaj',
                  messenger_extensions: true,
                  webview_height_ratio: 'full' // large view
                }
              ]
            }]
          }
        }
      }
  ]};
};

const createQuizButtonEng = (displayUrl) => {
  return {
    messages:[
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            image_aspect_ratio: 'square',
            elements: [{
              title: 'What type of traveler are you?',
              subtitle: '',
              buttons:[
                {
                  type: 'web_url',
                  url: displayUrl,
                  title: 'Find out here',
                  messenger_extensions: true,
                  webview_height_ratio: 'full' // large view
                }
              ]
            }]
          }
        }
      }
  ]};
};

const createButtonsSlo = () => {
  return {
    messages:[
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            image_aspect_ratio: 'square',
            elements: [{
              title: 'Izberi kraj:',
              subtitle: '',
              buttons:[
                {
                  type: 'web_url',
                  url: NOVO_MESTO_SLO_URL,
                  title: 'Novo mesto',
                  messenger_extensions: true,
                  webview_height_ratio: 'compact'
                },
                {
                  type: 'web_url',
                  url: CRNOMELJ_SLO_URL,
                  title: 'Črnomelj',
                  messenger_extensions: true,
                  webview_height_ratio: 'compact'
                },

                {
                  type: 'web_url',
                  url: KOCEVJE_SLO_URL,
                  title: 'Kočevje',
                  messenger_extensions: true,
                  webview_height_ratio: 'compact'
                }
              ]
            }]
          }
        }
      }
  ]};
};

const createButtonsEng = () => {
  return {
    messages:[
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            image_aspect_ratio: 'square',
            elements: [{
              title: 'Choose your destination:',
              subtitle: '',
              buttons:[
                {
                  type: 'web_url',
                  url: NOVO_MESTO_ENG_URL,
                  title: 'Novo mesto',
                  messenger_extensions: true,
                  webview_height_ratio: 'compact'
                },
                {
                  type: 'web_url',
                  url: CRNOMELJ_ENG_URL,
                  title: 'Črnomelj',
                  messenger_extensions: true,
                  webview_height_ratio: 'compact'
                },
                {
                  type: 'web_url',
                  url: KOCEVJE_ENG_URL,
                  title: 'Kočevje',
                  messenger_extensions: true,
                  webview_height_ratio: 'compact'
                }
              ]
            }]
          }
        }
      }
  ]};
};

const createCompactButton = (displayUrl) => {
  return {
    messages:[
      {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            image_aspect_ratio: 'square',
            elements: [{
              title: 'Welcome!',
              subtitle: 'Choose your preferences',
              buttons:[
                {
                  type: 'web_url',
                  url: displayUrl,
                  title: 'Webview (compact)',
                  messenger_extensions: true,
                  webview_height_ratio: 'compact' // Small view
                }
              ]
            }]
          }
        }
      }
  ]};
};

// <================================CHATFUEL SLO WEATHER TEMPLATE========================>

router.get('/weather-slo/chatfuel', (req, res, next) => {
  res.json(createButtonsSlo()); 
});

// <================================CHATFUEL ENG WEATHER TEMPLATE========================>

router.get('/weather-eng/chatfuel', (req, res, next) => {
  res.json(createButtonsEng()); 
});


//<=============================Weather Črnomelj req/res ============================>

//Testing req/res

router.get('/weather-crnomelj-slo/show', (req, res, next) => {
  res.sendFile('/var/www/messengerbot.si/api/general/public/visit-dolenjska/weather-crnomelj-slo/index.html');
});

router.get('/weather-crnomelj-eng/show', (req, res, next) => {
  res.sendFile('/var/www/messengerbot.si/api/general/public/visit-dolenjska/weather-crnomelj-eng/index.html');
});



router.post('', (req, res, next) => {
  res.status(200).json({
    message: 'Post request handled!'
  });
});

//<=============================Weather Novo mesto req/res ============================>

//Testing req/res

router.get('/weather-novo-mesto-slo/show', (req, res, next) => {
  res.sendFile('/var/www/messengerbot.si/api/general/public/visit-dolenjska/weather-novo-mesto-slo/index.html');
});

router.get('/weather-novo-mesto-eng/show', (req, res, next) => {
  res.sendFile('/var/www/messengerbot.si/api/general/public/visit-dolenjska/weather-novo-mesto-eng/index.html');
});

router.post('', (req, res, next) => {
  res.status(200).json({
    message: 'Post request handled!'
  });
});

//<=============================Weather Kočevje req/res ============================>

//Testing req/res

router.get('/weather-kocevje-slo/show', (req, res, next) => {
  res.sendFile('/var/www/messengerbot.si/api/general/public/visit-dolenjska/weather-kocevje-slo/index.html');
});

router.get('/weather-kocevje-eng/show', (req, res, next) => {
  res.sendFile('/var/www/messengerbot.si/api/general/public/visit-dolenjska/weather-kocevje-eng/index.html');
});




router.post('', (req, res, next) => {
  res.status(200).json({
    message: 'Post request handled!'
  });
});

// <================================CHATFUEL ENG WEATHER TEMPLATE========================>

router.get('/quiz-slo/chatfuel', (req, res, next) => {
    const userId = req.query.userId;
  const chatfuel_bot_id = req.query.chatfuel_bot_id;
  const chatfuel_token = req.query.chatfuel_token;
  const displayUrl = 'https://api.messengerbot.si/visit-dolenjska/webviews/quiz-slo/show?userId=' + userId + '&chatfuel_bot_id=' + chatfuel_bot_id + '&chatfuel_token=' + chatfuel_token;
  res.json(createQuizButtonSlo(displayUrl)); 
});

router.get('/quiz-eng/chatfuel', (req, res, next) => {
    const userId = req.query.userId;
  const chatfuel_bot_id = req.query.chatfuel_bot_id;
  const chatfuel_token = req.query.chatfuel_token;
  const displayUrl = 'https://api.messengerbot.si/visit-dolenjska/webviews/quiz-eng/show?userId=' + userId + '&chatfuel_bot_id=' + chatfuel_bot_id + '&chatfuel_token=' + chatfuel_token;
  res.json(createQuizButtonEng(displayUrl)); 
});



//<=============================Quiz visit dolenjska req/res ============================>

//Testing req/res

router.get('/quiz-slo/show', (req, res, next) => {
  res.sendFile('/var/www/messengerbot.si/api/general/public/visit-dolenjska/quiz/index.html');
});

router.get('/quiz-eng/show', (req, res, next) => {
  res.sendFile('/var/www/messengerbot.si/api/general/public/visit-dolenjska/quiz-eng/index.html');
});




router.post('', (req, res, next) => {
  res.status(200).json({
    message: 'Post request handled!'
  });
});


//<=============================Test req/res ============================>

//Testing req/res

router.get('', (req, res, next) => {
	 res.status(200).json({
    message: 'Get request handled!'
  });
});

router.post('', (req, res, next) => {
	res.status(200).json({
		message: 'Post request handled!'
	});
});

module.exports = router;
