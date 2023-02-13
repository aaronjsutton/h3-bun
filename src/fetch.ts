import { App, toNodeListener, promisifyNodeListener } from "h3";
import { createCall } from "unenv/runtime/fetch/index";
import { $URL } from "ufo";

export type FetchHandler = (request: Request) => Promise<Response>;

export function toFetchHandler(app: App): FetchHandler {
  const call = createCall(promisifyNodeListener(toNodeListener(app)));
  return async function toFetchHandle(input: Request): Promise<Response> {
    try {
      const url = new $URL(input.url).fullpath;
			if (input.method == "GET") console.log(input.headers.get("cookie"));
      const r = await call(new Request(url, input));
			console.log(r);
      return new Response(r.body, {
        status: r.status,
        statusText: r.statusText,
        headers: Object.fromEntries(
          Object.entries(r.headers).map(([name, value]) => [
            name,
            Array.isArray(value) ? value.join(",") : value || "",
          ])
        ),
      });
    } catch (error: any) {
      return new Response(error.toString(), {
        status: Number.parseInt(error.statusCode || error.code) || 500,
        statusText: error.statusText,
      });
    }
  };
}
