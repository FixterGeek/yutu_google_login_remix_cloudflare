import {
  redirect,
  type ActionFunction,
  LoaderArgs,
} from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { AiOutlineGoogle } from "react-icons/ai";
import { getAccessToken, getExtraData, redirectToGoogle } from "~/lib/google";
import { commitSession, getSession } from "~/sessions";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "google-login") {
    return redirectToGoogle<typeof redirect>(redirect);
  }
  return null;
};

export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const data = await getAccessToken(code);
    // check for errors
    const extra = await getExtraData(data.access_token);
    // save to db @TODO
    // set cookie
    const session = await getSession(request.headers.get("Cookie"));
    session.set("userId", extra.email);
    return redirect("/profile", {
      headers: {
        "set-cookie": await commitSession(session),
      },
    });
  }
  return null;
};

export default function Index() {
  return (
    <Form
      method="post"
      className="flex justify-center items-center min-h-screen"
    >
      <button className="bg-blue-200 py-2 px-8 text-lg rounded-md hover:bg-blue-300 flex items-center gap-2">
        <span>
          <AiOutlineGoogle />
        </span>
        <button name="intent" value="google-login" type="submit">
          Login con Google
        </button>
      </button>
    </Form>
  );
}
