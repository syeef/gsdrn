import type { LoaderFunctionArgs } from "react-router";
import IndexPage, { meta } from "./index";

export { meta };

export async function loader(_args: LoaderFunctionArgs) {
  return null;
}

export default function HomePage() {
  return <IndexPage />;
}
