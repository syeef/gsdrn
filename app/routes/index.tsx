import * as React from "react";
import {
  NavLink,
  type MetaFunction,
  type LoaderFunctionArgs,
  redirect,
} from "react-router";
import styles from "../styles/index.module.css";
import { getAuth } from "~/lib/auth.server";
import Title from "~/components/ui/Title/Title";
import Header from "~/components/ui/Header/Header";
import Calendar from "~/components/ui/Calendar/Calendar";
import Editor from "~/components/ui/Editor/Editor";
import { formatDateKey } from "~/utils/date";
// import HeroLaptop from "~/assets/images/background.png";
import HeroLaptop from "~/assets/images/background.jpg";

const HERO_SOURCE_WIDTH = 1536;
const HERO_SOURCE_HEIGHT = 1024;

const HERO_SCREEN_BOUNDS = {
  // x: 351,
  // y: 293,
  x: 348,
  y: 300,
  width: 831,
  // height: 423,
  height: 470,
} as const;

const HERO_SCREEN_FIT_SCALE = 0.96;

export const meta: MetaFunction = () => [
  { title: "GSDRN" },
  { name: "description", content: "Get Stuff Done Right Now" },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.pathname !== "/") return null;

  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });

  if (session) {
    throw redirect("/app");
  }

  return null;
}

export default function IndexPage() {
  const dateKey = React.useMemo(() => formatDateKey(new Date()), []);
  const heroFrameRef = React.useRef<HTMLDivElement | null>(null);
  const [screenRect, setScreenRect] = React.useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  React.useEffect(() => {
    const frame = heroFrameRef.current;
    if (!frame) return;

    const updateScreenRect = () => {
      const frameRect = frame.getBoundingClientRect();
      const frameWidth = frameRect.width;
      const frameHeight = frameRect.height;
      if (frameWidth <= 0 || frameHeight <= 0) return;

      const scale = Math.max(
        frameWidth / HERO_SOURCE_WIDTH,
        frameHeight / HERO_SOURCE_HEIGHT,
      );
      const renderedWidth = HERO_SOURCE_WIDTH * scale;
      const renderedHeight = HERO_SOURCE_HEIGHT * scale;
      const cropX = (frameWidth - renderedWidth) / 2;
      const cropY = (frameHeight - renderedHeight) / 2;

      const next = {
        left: cropX + HERO_SCREEN_BOUNDS.x * scale,
        top: cropY + HERO_SCREEN_BOUNDS.y * scale,
        width: HERO_SCREEN_BOUNDS.width * scale,
        height: HERO_SCREEN_BOUNDS.height * scale,
      };

      const fittedWidth = next.width * HERO_SCREEN_FIT_SCALE;
      const fittedHeight = next.height * HERO_SCREEN_FIT_SCALE;
      const fittedRect = {
        left: next.left + (next.width - fittedWidth) / 2,
        top: next.top + (next.height - fittedHeight) / 2,
        width: fittedWidth,
        height: fittedHeight,
      };

      setScreenRect((current) => {
        if (!current) return fittedRect;
        const changed =
          Math.abs(current.left - fittedRect.left) > 0.25 ||
          Math.abs(current.top - fittedRect.top) > 0.25 ||
          Math.abs(current.width - fittedRect.width) > 0.25 ||
          Math.abs(current.height - fittedRect.height) > 0.25;
        return changed ? fittedRect : current;
      });
    };

    updateScreenRect();
    const observer = new ResizeObserver(updateScreenRect);
    observer.observe(frame);
    window.addEventListener("resize", updateScreenRect);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScreenRect);
    };
  }, []);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.heroContainer}>
          <div className={styles.heroBackground}></div>
          <div className={styles.heroTextContainer}>
            <Title
              as="h1"
              variant="GoogleSans"
              headingColor="gray"
              className={styles.heroText}
            >
              Be productive, feel great.
            </Title>
          </div>
          <div className={styles.heroLaptop} ref={heroFrameRef}>
            <img
              className={styles.heroLaptopImage}
              src={HeroLaptop}
              alt=""
              aria-hidden="true"
            />
            <div
              className={styles.heroScreen}
              style={
                screenRect
                  ? {
                      left: `${screenRect.left}px`,
                      top: `${screenRect.top}px`,
                      width: `${screenRect.width}px`,
                      height: `${screenRect.height}px`,
                    }
                  : undefined
              }
            >
              <div className={styles.heroScreenInner}>
                <div className={styles.previewApp}>
                  <Header dateKey={dateKey} />
                  <main className={styles.previewMain}>
                    <section className={styles.previewCalendar}>
                      <Calendar dateKey={dateKey} />
                    </section>
                    <section className={styles.previewEditors}>
                      <div className={styles.previewPanel}>
                        <div className={styles.previewPanelHeader}>
                          <Title variant="Lora" as="h3">
                            Tasks
                          </Title>
                        </div>
                        <div className={styles.previewPanelBody}>
                          <Editor mode="todos" dateKey={dateKey} />
                        </div>
                      </div>
                      <div className={styles.previewPanel}>
                        <div className={styles.previewPanelHeader}>
                          <Title variant="Lora" as="h3">
                            Notes
                          </Title>
                        </div>
                        <div className={styles.previewPanelBody}>
                          <Editor mode="notes" dateKey={dateKey} />
                        </div>
                      </div>
                    </section>
                  </main>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <ul>
            <NavLink to="/signup">Sign Up</NavLink>
            <NavLink to="/login">Login</NavLink>
          </ul>
        </div>
      </div>
    </>
  );
}

// export { IndexPage };
