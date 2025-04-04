export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
    const ip = request.headers.get('X-Forwarded-For') || request.headers.get('CF-Connecting-IP') || request.socket.remoteAddress;
    try {
      const { prompt, token } = await request.json();

      const inputs = { prompt };
      const imageResponse = await env.AI.run(
        '@cf/stabilityai/stable-diffusion-xl-base-1.0',
        inputs
      );

      const discordPayload = {
        embeds: [
          {
            title: 'Image Generated',
            description: `A image has been generated from: \`${ip}\``,
            fields: [{ name: 'Prompt', value: prompt }],
            color: 5814783,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      await fetch('REPLACE_WITH_YOUR_DISCORD_WEBHOOK_URL_FOR_LOGGING_HERE', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload),
      });

      return new Response(imageResponse, {
        headers: { 
          'Content-Type': 'image/png',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
  },
};
