import * as React from "react";
import { Avatar as BaseAvatar } from "@base-ui-components/react/avatar";
import { useRouteLoaderData } from "react-router";
import type { loader as rootLoader } from "~/root"; // adjust import to your root route
import { getFullName, getInitials } from "~/utils/User";
import styles from "./Avatar.module.css";

type UserLike = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type Props = React.ComponentPropsWithoutRef<typeof BaseAvatar.Root> & {
  user?: UserLike | null;
  size?: number; // px
};

export default function Avatar({
  user: userProp,
  size = 36,
  className,
  ...rest
}: Props) {
  // pull from root loader if user prop not provided
  const data = useRouteLoaderData<typeof rootLoader>("root");
  const user = userProp ?? (data as any)?.user ?? null;

  const initials = getInitials(user);
  const fullName = getFullName(user);
  const img = user?.image ?? null;

  const style = { ...(rest as any).style, ["--size" as any]: `${size}px` };

  // console.log(data);
  // console.log(img);
  return (
    <BaseAvatar.Root
      {...rest}
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={style}
      aria-label={fullName || initials}
    >
      {img ? (
        <BaseAvatar.Image
          className={styles.image}
          src={img}
          alt={fullName || "User avatar"}
        />
      ) : null}
      <BaseAvatar.Fallback aria-hidden={!!img}>{initials}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
