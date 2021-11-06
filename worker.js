addEventListener("fetch", (event) => {
    event.respondWith(
      handleRequest(event.request).catch(
        (err) => new Response(err.stack, { status: 500 })
      )
    );
  });
  
  /* example request body
      { "url": "https://www.bbc.com/news/something-with-a-link" }
  */
  
  function getHash() {
    //https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
  }
  
  //put the url of your worker here, or a dns name
  const baseUrl = "https://my-worker.dev-cloudflare9033.workers.dev/";
  
  async function handleRequest(request) {
  
    if (request.method === "POST") {
      const body = await request.json();
      const hash = getHash();
      await SHORT_LINKS.put(hash, body.url);
      const resp = { shortUrl: baseUrl + hash };
      const json = JSON.stringify(resp, null, 2);
      return new Response(json, { headers: { "content-type": "application/json;charset=UTF-8", }});
    } else if (request.method === "GET") {
      const url = new URL(request.url);
      const { pathname } = url; //pathname starts with "/"
      const shortLinkHash = pathname.substr(1); //remove leading "/"
      let value = await SHORT_LINKS.get(shortLinkHash);
  
      if (value === null) {
          return new Response(`Shortlink not found.`, { status: 404 });
      }
  
      return Response.redirect(value, 301);
    } else {
      return new Response(`Method ${request.method} not allowed.`, {
        status: 405,
        headers: {
          Allow: "GET, POST",
        },
      });
    }
  }