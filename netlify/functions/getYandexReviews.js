/*
 * Это бессерверная функция (Serverless Function).
 * Она будет работать на вашем хостинге и безопасно получать данные от Яндекса.
 */
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const orgId = '198259889276';
  const reviewsCount = 8;
  
  // Ваш токен будет безопасно храниться в переменных окружения на хостинге.
  const oauthToken = process.env.YANDEX_OAUTH_TOKEN;

  if (!oauthToken) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "OAuth token не настроен на сервере." })
    };
  }

  // --- ИСПРАВЛЕНИЕ ЗДЕСЬ: .ru заменен на .com ---
  const apiUrl = `https://api.business.yandex.com/v1/chain-main/organizations/${orgId}/reviews?take=${reviewsCount}&sort=by_time`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `OAuth ${oauthToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Yandex API Error:', errorBody);
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: `Ошибка от API Яндекса: ${response.statusText}` })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Internal Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Внутренняя ошибка сервера: ${error.message}` })
    };
  }
};
