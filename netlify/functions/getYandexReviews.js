/*
 * Это бессерверная функция (Serverless Function).
 * Она будет работать на вашем хостинге и безопасно получать данные от Яндекса.
 * В эту версию добавлена улучшенная диагностика для поиска ошибки.
 */
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  console.log("--- Запуск функции ---");

  const orgId = '198259889276';
  const reviewsCount = 8;
  const oauthToken = process.env.YANDEX_OAUTH_TOKEN;

  // Шаг 1: Проверяем, что токен доступен
  if (!oauthToken) {
    console.error("ОШИБКА: Переменная YANDEX_OAUTH_TOKEN не найдена!");
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "OAuth token не настроен на сервере." })
    };
  }
  console.log("Токен найден. Первые 4 символа:", oauthToken.substring(0, 4) + "...");

  // Шаг 2: Формируем URL
  const apiUrl = `https://api.business.yandex.com/v1/chain-main/organizations/${orgId}/reviews?take=${reviewsCount}&sort=by_time`;
  console.log("Запрос к API по адресу:", apiUrl);

  try {
    // Шаг 3: Выполняем запрос
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `OAuth ${oauthToken}`,
        'Accept': 'application/json',
        'User-Agent': 'NetlifyFunction/1.0' // Добавим User-Agent на всякий случай
      }
    });

    console.log(`Ответ от Яндекса получен. Статус: ${response.status} ${response.statusText}`);

    // Шаг 4: Проверяем, успешен ли ответ
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("ОШИБКА от API Яндекса:", errorBody);
      return {
        statusCode: response.status,
        body: JSON.stringify({ 
          message: `Ошибка от API Яндекса: ${response.statusText}`,
          details: errorBody 
        })
      };
    }

    // Шаг 5: Если все хорошо, парсим и отправляем данные
    const data = await response.json();
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
    // Шаг 6: Ловим самые критические ошибки (например, проблемы с сетью)
    console.error("КРИТИЧЕСКАЯ ОШИБКА:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: `Внутренняя ошибка сервера при выполнении запроса.`,
        error_details: {
            name: error.name,
            message: error.message,
            code: error.code,
            errno: error.errno
        }
      })
    };
  }
};
