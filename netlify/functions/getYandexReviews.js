/*
 * Это бессерверная функция (Serverless Function).
 * В этой версии используется другой HTTP-клиент (axios) для обхода сетевых проблем.
 */
const axios = require('axios');

exports.handler = async function(event, context) {
  console.log("--- Запуск функции с axios ---");

  const orgId = '198259889276';
  const reviewsCount = 8;
  const oauthToken = process.env.YANDEX_OAUTH_TOKEN;

  if (!oauthToken) {
    console.error("ОШИБКА: Переменная YANDEX_OAUTH_TOKEN не найдена!");
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "OAuth token не настроен на сервере." })
    };
  }
  console.log("Токен найден. Первые 4 символа:", oauthToken.substring(0, 4) + "...");

  const apiUrl = `https://api.business.yandex.com/v1/chain-main/organizations/${orgId}/reviews?take=${reviewsCount}&sort=by_time`;
  console.log("Запрос к API по адресу:", apiUrl);

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `OAuth ${oauthToken}`,
        'Accept': 'application/json',
        'User-Agent': 'NetlifyFunction/1.0 (axios)'
      }
    });

    console.log(`Ответ от Яндекса получен. Статус: ${response.status} ${response.statusText}`);

    // У axios данные находятся в response.data
    const data = response.data;
    console.log("Данные успешно получены и отправлены на сайт.");
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error("КРИТИЧЕСКАЯ ОШИБКА:", error.toJSON ? error.toJSON() : error);
    return {
      statusCode: error.response ? error.response.status : 500,
      body: JSON.stringify({ 
        message: `Внутренняя ошибка сервера при выполнении запроса.`,
        error_details: error.message
      })
    };
  }
};
