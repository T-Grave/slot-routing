import { ActionArgs, json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
export { defaultShouldRevalidate as shouldRevalidate } from "~/slot-router/defaultShouldRevalidate";

export const loader = () => {
  return json({ result: "C" });
};

export async function action({ request }: ActionArgs) {
  const body = await request.formData();
  console.log(body.get("title"));
  return redirect(`/a`);
}

export default function C() {
  const data = useLoaderData<typeof loader>();
  console.log("C data: ", data);
  return (
    <div>
      <h3>Content Page A-Test</h3>
      <Form method="post">
        <input type="text" name="title" />
        <button type="submit">Post</button>
      </Form>
    </div>
  );
}
