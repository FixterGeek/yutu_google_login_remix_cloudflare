import {
  redirect,
  type LoaderArgs,
  type ActionArgs,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { commitSession, getSession } from "~/sessions";

export const action = async ({ request }: ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  session.unset("userId");
  throw redirect("/", {
    headers: { "set-cookie": await commitSession(session) },
  });
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("userId")) {
    throw redirect("/");
  }
  return { email: session.get("userId") };
};

export default function Profile() {
  const { email } = useLoaderData();
  return (
    <Form method="post">
      <h2>Bienvenido {email}</h2>
      <button type="submit">Cerrar sesión</button>
    </Form>
  );
}
