import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
  color?: string;
  wordMarkColor?: string;
  height?: number | string;
  width?: number | string;
};

export function LogoMark({
  color = "currentColor",
  height = 24,
  width = 24,
  className,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M11 7C11 8.10457 11.8954 9 13 9L19 9C20.1046 9 21 8.10457 21 7V1C21 0.447715 21.4477 0 22 0C22.5523 0 23 0.447715 23 1V7C23 8.10457 23.8954 9 25 9H31C31.5523 9 32 9.44772 32 10C32 10.5523 31.5523 11 31 11H25C23.8954 11 23 11.8954 23 13V19C23 20.1046 23.8954 21 25 21H31C31.5523 21 32 21.4477 32 22C32 22.5523 31.5523 23 31 23H25C23.8954 23 23 23.8954 23 25V31C23 31.5523 22.5523 32 22 32C21.4477 32 21 31.5523 21 31V25C21 23.8954 20.1046 23 19 23H13C11.8954 23 11 23.8954 11 25V31C11 31.5523 10.5523 32 10 32C9.44772 32 9 31.5523 9 31V25C9 23.8954 8.10457 23 7 23H1C0.447715 23 0 22.5523 0 22C0 21.4477 0.447715 21 1 21H9L9 13C9 11.8954 8.10457 11 7 11H1C0.447715 11 0 10.5523 0 10C0 9.44772 0.447715 9 1 9H7C8.10457 9 9 8.10457 9 7V1C9 0.447715 9.44772 0 10 0C10.5523 0 11 0.447715 11 1V7ZM13 11C11.8954 11 11 11.8954 11 13L11 19C11 20.1046 11.8954 21 13 21H19C20.1046 21 21 20.1046 21 19V13C21 11.8954 20.1046 11 19 11L13 11Z"
        fill={color}
      />
    </svg>
  );
}

export function Icon10SecondsBackwards({
  color = "currentColor",
  height = 24,
  width = 24,
  className,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.3122 13.0333C16.2452 9.68527 15.098 5.40414 11.75 3.47114C8.66695 1.69115 4.7927 2.52297 2.68933 5.28009"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M2.19 2.07761V5.07761C2.19 5.62989 2.63772 6.07761 3.19 6.07761H5.69"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.63601 8.49982C8.42155 8.49989 9.03433 8.79778 9.44673 9.40051C9.85007 9.99016 10.0413 10.7965 10.0413 11.7998C10.0413 12.7978 9.84949 13.6033 9.44673 14.1983C9.03433 14.801 8.42155 15.0997 7.63601 15.0998C6.85034 15.0998 6.23774 14.8019 5.82529 14.1991L5.82445 14.1983C5.42173 13.6034 5.22992 12.7978 5.22992 11.7998C5.22992 10.7964 5.42184 9.99018 5.82529 9.40051C6.23774 8.79773 6.85034 8.49982 7.63601 8.49982ZM7.63601 9.4726C7.23133 9.4726 6.93641 9.64593 6.73192 10.0095C6.51934 10.3876 6.40286 10.9769 6.40286 11.7998C6.40286 12.6228 6.51934 13.2121 6.73192 13.5902C6.93641 13.9537 7.23133 14.127 7.63601 14.127C8.04054 14.1269 8.33482 13.9536 8.53925 13.5902C8.75186 13.2121 8.86916 12.6228 8.86916 11.7998C8.86916 10.9768 8.75186 10.3876 8.53925 10.0095C8.33482 9.64602 8.04054 9.47269 7.63601 9.4726Z"
        fill={color}
      />
      <path
        d="M4.31142 15.0133H3.16477V9.9577L1.63647 11.3393V9.97381L1.69754 9.92123L3.27503 8.5863H4.31142V15.0133Z"
        fill={color}
      />
    </svg>
  );
}

export function Icon10SecondsForwards({
  color = "currentColor",
  height = 24,
  width = 24,
  className,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.68784 13.0333C-0.24516 9.68527 0.901965 5.40414 4.25001 3.47114C7.33305 1.69115 11.2073 2.52297 13.3107 5.28009"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M13.81 2.07761V5.07761C13.81 5.62989 13.3623 6.07761 12.81 6.07761H10.31"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9595 8.5C12.7451 8.50008 13.3579 8.79797 13.7702 9.40069C14.1736 9.99034 14.3648 10.7967 14.3648 11.8C14.3648 12.798 14.173 13.6035 13.7702 14.1985C13.3579 14.8012 12.7451 15.0999 11.9595 15.1C11.1739 15.1 10.5613 14.8021 10.1488 14.1993L10.148 14.1985C9.74525 13.6035 9.55344 12.798 9.55344 11.8C9.55344 10.7965 9.74535 9.99036 10.1488 9.40069C10.5613 8.79792 11.1739 8.5 11.9595 8.5ZM11.9595 9.47278C11.5548 9.47278 11.2599 9.64611 11.0554 10.0096C10.8429 10.3877 10.7264 10.9771 10.7264 11.8C10.7264 12.6229 10.8429 13.2123 11.0554 13.5904C11.2599 13.9539 11.5548 14.1272 11.9595 14.1272C12.3641 14.1271 12.6583 13.9538 12.8628 13.5904C13.0754 13.2123 13.1927 12.623 13.1927 11.8C13.1927 10.977 13.0754 10.3877 12.8628 10.0096C12.6583 9.64621 12.3641 9.47287 11.9595 9.47278Z"
        fill={color}
      />
      <path
        d="M8.63493 15.0135H7.48829V9.95788L5.95999 11.3395V9.974L6.02106 9.92141L7.59854 8.58649H8.63493V15.0135Z"
        fill={color}
      />
    </svg>
  );
}

export function ArrowRight({
  color = "currentColor",
  height = 24,
  width = 24,
  className,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M13.75 6.75L19.25 12L13.75 17.25"
      ></path>
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M19 12H4.75"
      ></path>
    </svg>
  );
}

export function Menu({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg width={width} height={height} fill="none" viewBox="0 0 24 24">
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M4.75 5.75H19.25"
      ></path>
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M4.75 18.25H19.25"
      ></path>
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M4.75 12H19.25"
      ></path>
    </svg>
  );
}

export function IconAiText({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.75 1.25H15.25M8.75 5.25H15.25M12.75 9.25H15.25M12.75 13.25H15.25M4.9999 6.25L3.78568 9.2855L0.75 10.4998L3.78561 11.714L4.99999 14.75L6.2144 11.7141L9.25 10.4998L6.2141 9.2854L4.9999 6.25Z"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function IconAnimationEnter({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.75 2.99998L7.294 2.45698C7.51799 2.23287 7.78395 2.05508 8.07667 1.93379C8.36939 1.81249 8.68314 1.75006 9 1.75006C9.31686 1.75006 9.63061 1.81249 9.92333 1.93379C10.2161 2.05508 10.482 2.23287 10.706 2.45698L14.544 6.29398C15.485 7.23598 15.485 8.76398 14.544 9.70598L10.706 13.544C10.482 13.7681 10.2161 13.9459 9.92333 14.0672C9.63061 14.1885 9.31686 14.2509 9 14.2509C8.68314 14.2509 8.36939 14.1885 8.07667 14.0672C7.78395 13.9459 7.51799 13.7681 7.294 13.544L6.751 13M8.25 7.99998H0.75M8.25 7.99998L5.75 5.74998M8.25 7.99998L5.75 10.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconBookmark({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.75 2.75C2.75 1.64543 3.64543 0.75 4.75 0.75H11.25C12.3546 0.75 13.25 1.64543 13.25 2.75V15.25L8 10.75L2.75 15.25V2.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Close({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg width={width} height={height} fill="none" viewBox="0 0 24 24">
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M17.25 6.75L6.75 17.25"
      ></path>
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M6.75 6.75L17.25 17.25"
      ></path>
    </svg>
  );
}

export function IconCalendar({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.75 4.75C0.75 3.64543 1.64543 2.75 2.75 2.75H13.25C14.3546 2.75 15.25 3.64543 15.25 4.75V13.25C15.25 14.3546 14.3546 15.25 13.25 15.25H2.75C1.64543 15.25 0.75 14.3546 0.75 13.25V4.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 0.75V4.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 0.75V4.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75 6.75H12.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCalendarTimer({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.25 5.25V4.75C15.25 4.21957 15.0393 3.71086 14.6642 3.33579C14.2891 2.96071 13.7804 2.75 13.25 2.75H2.75C2.21957 2.75 1.71086 2.96071 1.33579 3.33579C0.960714 3.71086 0.75 4.21957 0.75 4.75V13.25C0.75 13.7804 0.960714 14.2891 1.33579 14.6642C1.71086 15.0393 2.21957 15.25 2.75 15.25H5.25M11 9.75V11L12.25 12.25M4 0.75V4.25M12 0.75V4.25M11 15.25C9.87283 15.25 8.79183 14.8022 7.9948 14.0052C7.19777 13.2082 6.75 12.1272 6.75 11C6.75 9.87283 7.19777 8.79183 7.9948 7.9948C8.79183 7.19777 9.87283 6.75 11 6.75C12.1272 6.75 13.2082 7.19777 14.0052 7.9948C14.8022 8.79183 15.25 9.87283 15.25 11C15.25 12.1272 14.8022 13.2082 14.0052 14.0052C13.2082 14.8022 12.1272 15.25 11 15.25Z"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function IconChevronRight({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.25 4.75L9.75 8L6.25 11.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconChevronLeft({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.75 4.75L6.25 8L9.75 11.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCheck({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.75 12.75L10 15.25L16.25 8.75"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
    </svg>
  );
}

export function IconClock({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 15.25C12.0041 15.25 15.25 12.0041 15.25 8C15.25 3.99594 12.0041 0.75 8 0.75C3.99594 0.75 0.75 3.99594 0.75 8C0.75 12.0041 3.99594 15.25 8 15.25Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <path d="M8 4V8L10 10" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

export function IconCode({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.25 0.75H2.75C1.64543 0.75 0.75 1.64543 0.75 2.75V13.25C0.75 14.3546 1.64543 15.25 2.75 15.25H13.25C14.3546 15.25 15.25 14.3546 15.25 13.25V2.75C15.25 1.64543 14.3546 0.75 13.25 0.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.75 6.75L7.25 9L4.75 11.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCompute({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.75.75v1.5m9.5 3.5h-1.5m-8 8v1.5m-3.5-9.5H.75m9.5-5v1.5m5 8h-1.5m-3.5 3.5v1.5m-8-5H.75m2-5.5a2 2 0 0 1 2-2h6.5a2 2 0 0 1 2 2v6.5a2 2 0 0 1-2 2h-6.5a2 2 0 0 1-2-2z"
      />
    </svg>
  );
}

export function IconCursor({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.75 1.75L7 14.25L9 9L14.25 7L1.75 1.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 9L14.25 14.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCursorList({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.75 9H15.25M10.75 12H15.25M10.75 15H15.25M0.75 1L2.86111 11.5L5.5 6.75L10.25 5.31818L0.75 1Z"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function IconDatabases({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.25 8c0 1.105-3.384 2.25-7.25 2.25S.75 9.105.75 8m14.5-5c0 1.105-3.384 2.25-7.25 2.25S.75 4.105.75 3 4.134.75 8 .75 15.25 1.895 15.25 3" />
        <path d="M15.25 3v10c0 1.105-3.384 2.25-7.25 2.25S.75 14.105.75 13V3" />
      </g>
    </svg>
  );
}

export function IconDeveloper({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.25.75H2.75a2 2 0 0 0-2 2v10.5a2 2 0 0 0 2 2h10.5a2 2 0 0 0 2-2V2.75a2 2 0 0 0-2-2" />
        <path d="M4.75 6.75 7.25 9l-2.5 2.25" />
      </g>
    </svg>
  );
}

export function IconDevices2({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.25 13.25H2.75C2.21957 13.25 1.71086 13.0393 1.33579 12.6642C0.960714 12.2891 0.75 11.7804 0.75 11.25V2.75001C0.75 2.21957 0.960714 1.71086 1.33579 1.33579C1.71086 0.960719 2.21957 0.750006 2.75 0.750006H13.25C13.5278 0.74934 13.8026 0.80683 14.0568 0.918778C14.311 1.03073 14.539 1.19465 14.726 1.40001M9.75 15.25H13.25C13.7804 15.25 14.2891 15.0393 14.6642 14.6642C15.0393 14.2891 15.25 13.7804 15.25 13.25V6.75001C15.25 6.21957 15.0393 5.71087 14.6642 5.33579C14.2891 4.96072 13.7804 4.75001 13.25 4.75001H9.75C9.21957 4.75001 8.71086 4.96072 8.33579 5.33579C7.96071 5.71087 7.75 6.21957 7.75 6.75001V13.25C7.75 13.7804 7.96071 14.2891 8.33579 14.6642C8.71086 15.0393 9.21957 15.25 9.75 15.25Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconDoubleChevronUpDown({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.25 9.25L12 5.75L8.75 9.25M15.25 14.75L12 18.25L8.75 14.75"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
    </svg>
  );
}

export function IconEye({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.25 8C15.25 9 13.5 14.25 8 14.25C2.5 14.25 0.75 9 0.75 8C0.75 7 2.5 1.75 8 1.75C13.5 1.75 15.25 7 15.25 8Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10.25C9.24264 10.25 10.25 9.24264 10.25 8C10.25 6.75736 9.24264 5.75 8 5.75C6.75736 5.75 5.75 6.75736 5.75 8C5.75 9.24264 6.75736 10.25 8 10.25Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconEyeOff({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.6247 6C15.0646 6.8986 15.25 7.6745 15.25 8C15.25 9 13.5 14.25 8 14.25C7.2686 14.25 6.6035 14.1572 6 13.9938M3 12.2686C1.36209 10.6693 0.75 8.5914 0.75 8C0.75 7 2.5 1.75 8 1.75C9.7947 1.75 11.1901 2.30902 12.2558 3.09698"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.25 0.75L0.75 15.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.409 9.59099C5.53033 8.71229 5.53033 7.28769 6.409 6.40899C7.2877 5.53029 8.7123 5.53029 9.591 6.40899"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconFaucet({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.25 2.75L0.75 3.75V15.25H3.25C3.78043 15.25 4.28914 15.0393 4.66421 14.6642C5.03929 14.2891 5.25 13.7804 5.25 13.25V9.25M5.25 2.75L12.25 0.75M5.25 2.75V4.75M5.25 9.25C5.25 9.25 10.25 7.25 15.25 7.25V4.75H5.25M5.25 9.25V4.75M15.25 14C15.25 14.3315 15.1183 14.6495 14.8839 14.8839C14.6495 15.1183 14.3315 15.25 14 15.25C13.6685 15.25 13.3505 15.1183 13.1161 14.8839C12.8817 14.6495 12.75 14.3315 12.75 14C12.75 13.31 14 11.75 14 11.75C14 11.75 15.25 13.31 15.25 14Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconFrame({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.75 0.75V15.25M13.2502 0.75V15.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.25 2.75H0.75M15.25 13.2502H0.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconGallaryView({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.125 3.75C7.125 2.64543 8.0204 1.75 9.125 1.75H13.625C14.7296 1.75 15.625 2.64543 15.625 3.75V12.25C15.625 13.3546 14.7296 14.25 13.625 14.25H9.125C8.0204 14.25 7.125 13.3546 7.125 12.25V3.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.625 4.5C7.0392 4.5 7.375 4.16421 7.375 3.75C7.375 3.33579 7.0392 3 6.625 3V4.5ZM6.625 14C7.0392 14 7.375 13.6642 7.375 13.25C7.375 12.8358 7.0392 12.5 6.625 12.5V14ZM6.125 4.5H6.625V3H6.125V4.5ZM6.625 12.5H6.125V14H6.625V12.5ZM4.875 11.25V5.75H3.375V11.25H4.875ZM6.125 12.5C5.43464 12.5 4.875 11.9404 4.875 11.25H3.375C3.375 12.7688 4.60622 14 6.125 14V12.5ZM6.125 3C4.60622 3 3.375 4.23122 3.375 5.75H4.875C4.875 5.05964 5.43464 4.5 6.125 4.5V3Z"
        fill={color}
      />
      <path
        d="M3.625 5.5C4.03921 5.5 4.375 5.16421 4.375 4.75C4.375 4.33579 4.03921 4 3.625 4V5.5ZM3.625 13C4.03921 13 4.375 12.6642 4.375 12.25C4.375 11.8358 4.03921 11.5 3.625 11.5V13ZM3.125 5.5H3.625V4H3.125V5.5ZM3.625 11.5H3.125V13H3.625V11.5ZM1.875 10.25V6.75H0.375V10.25H1.875ZM3.125 11.5C2.43464 11.5 1.875 10.9404 1.875 10.25H0.375C0.375 11.7688 1.60622 13 3.125 13V11.5ZM3.125 4C1.60622 4 0.375 5.23122 0.375 6.75H1.875C1.875 6.0596 2.43464 5.5 3.125 5.5V4Z"
        fill={color}
      />
    </svg>
  );
}

export function IconHammer({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.75 9.25V6.25H4.25V7.25C4.25 7.8023 3.80228 8.25 3.25 8.25H1.75C1.19772 8.25 0.75 7.8023 0.75 7.25V1.75C0.75 1.19772 1.19772 0.75 1.75 0.75H3.25C3.80228 0.75 4.25 1.19772 4.25 1.75V2.75H11C11 2.75 15.25 2.75 15.25 7.25C15.25 7.25 13 6.25 10.25 6.25V9.25M6.75 9.25H10.25M6.75 9.25V15.25M10.25 9.25V15.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconHeart({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.995 3.2332C6.5455 1.61 4.12832 1.17336 2.31215 2.65973C0.49599 4.1461 0.2403 6.63121 1.66654 8.38921L7.995 14.25L14.3235 8.38921C15.7498 6.63121 15.5253 4.13047 13.6779 2.65973C11.8305 1.189 9.4446 1.61 7.995 3.2332Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconHeadphones({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.866 10.25L15.213 8.063C15.64 4.148 12.29 0.75 8 0.75C3.71 0.75 0.359998 4.148 0.786998 8.063L1.134 10.25M4.442 15.054L3.916 15.182C2.754 15.466 1.559 14.837 1.248 13.779L0.824997 12.342C0.512997 11.284 1.203 10.196 2.365 9.912L2.892 9.784C3.472 9.642 4.07 9.956 4.226 10.485L5.213 13.839C5.368 14.368 5.022 14.912 4.442 15.054ZM11.558 15.054L12.084 15.182C13.246 15.466 14.441 14.837 14.752 13.779L15.175 12.342C15.487 11.284 14.797 10.196 13.635 9.912L13.108 9.784C12.528 9.642 11.93 9.956 11.774 10.485L10.787 13.839C10.632 14.368 10.978 14.912 11.558 15.054Z"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function IconHome({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.353 5.44v8.379a.93.93 0 0 1-.93.931H3.577a.93.93 0 0 1-.931-.931v-8.38m-1.397.932L8 1.25l6.75 5.12"
      />
    </svg>
  );
}

export function IconLinkedIn({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.75 7.75C4.75 6.09315 6.09315 4.75 7.75 4.75H16.25C17.9069 4.75 19.25 6.09315 19.25 7.75V16.25C19.25 17.9069 17.9069 19.25 16.25 19.25H7.75C6.09315 19.25 4.75 17.9069 4.75 16.25V7.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M10.75 16.25V14C10.75 12.7574 11.7574 11.75 13 11.75C14.2426 11.75 15.25 12.7574 15.25 14V16.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M10.75 11.75V16.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M7.75 11.75V16.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M7.75 8.75V9.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}

export function IconLivestream({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.75 1.75C13.7086 3.04802 15.25 5.47441 15.25 8C15.25 10.5257 13.7086 12.952 11.75 14.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.25 1.75C2.29145 3.04802 0.75 5.47441 0.75 8C0.75 10.5257 2.29145 12.952 4.25 14.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.75 4.75C11.5222 5.51951 12.25 6.8238 12.25 8C12.25 9.1763 11.5222 10.4805 10.75 11.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.25 4.75C4.47784 5.51951 3.75 6.8238 3.75 8C3.75 9.1763 4.47784 10.4805 5.25 11.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 8C8.5 8.2761 8.2761 8.5 8 8.5C7.7239 8.5 7.5 8.2761 7.5 8C7.5 7.7239 7.7239 7.5 8 7.5C8.2761 7.5 8.5 7.7239 8.5 8Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconLogin({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.75 4.75L9.25 8L5.75 11.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.75 0.75H13.25C14.3546 0.75 15.25 1.64543 15.25 2.75V13.25C15.25 14.3546 14.3546 15.25 13.25 15.25H5.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 8H0.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconMail({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.75 4.75L8 0.75L15.25 4.75V13.25C15.25 14.3546 14.3546 15.25 13.25 15.25H2.75C1.64543 15.25 0.75 14.3546 0.75 13.25V4.75Z"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15 5L9.25 9.25H6.75L1 5"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function IconMap({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.75 2.75L5.25 0.75V13.25L0.75 15.25V2.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.75 2.75L15.25 0.75V13.25L10.75 15.25V2.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.75 2.75L5.25 0.75V13.25L10.75 15.25V2.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconMonitor2({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_2289_236)">
        <path
          d="M5.75 11.25H13.25C14.3546 11.25 15.25 10.3546 15.25 9.25V2.75C15.25 1.64543 14.3546 0.75 13.25 0.75H2.75C1.64543 0.75 0.75 1.64543 0.75 2.75V9.25C0.75 10.3546 1.64543 11.25 2.75 11.25H5.75ZM5.75 11.25C5.75 11.25 6 14.25 4 15.25H12C10 14.25 10.25 11.25 10.25 11.25"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_2289_236">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function IconNetwork({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.276 4.276h.01m-.01 7.448h.01m7.438-7.448h.01m-.01 7.448h.01M9.163 8a1.164 1.164 0 1 1-2.328 0 1.164 1.164 0 0 1 2.328 0m0-5.586a1.164 1.164 0 1 1-2.328 0 1.164 1.164 0 0 1 2.328 0M14.75 8a1.164 1.164 0 1 1-2.327 0 1.164 1.164 0 0 1 2.327 0M3.578 8A1.164 1.164 0 1 1 1.25 8a1.164 1.164 0 0 1 2.328 0m5.586 5.586a1.164 1.164 0 1 1-2.327 0 1.164 1.164 0 0 1 2.327 0"
      />
    </svg>
  );
}

export function IconNew({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 1.75v12.5M14.25 8H1.75"
      />
    </svg>
  );
}

export function IconOrderedList({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.75 2.25L2.25 0.75V6.25M2.25 6.25H0.75M2.25 6.25H3.25"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M9.25 10.25H7.6562C6.9255 10.25 6.5182 9.4359 6.9058 8.8574C6.9535 8.7861 7.0211 8.7311 7.0925 8.6836L8.8924 7.486C8.9638 7.4384 9.0312 7.3832 9.0799 7.3126C9.5253 6.6678 9.0713 5.75 8.2526 5.75H6.75"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12.75 10.75H14.1964C15.4308 10.75 15.6499 12.6376 14.5101 12.9556C14.4549 12.971 14.397 12.9772 14.3398 12.9792L13.75 13L14.3398 13.0208C14.397 13.0228 14.4549 13.0289 14.5101 13.0444C15.6499 13.3624 15.4308 15.25 14.1964 15.25H12.75"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function IconPause({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.25 2.75V13.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.75 2.75V13.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPenTool({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.75 9L3.75 15.25H12.25L14.25 9L8 0.75L1.75 9Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.75 15.25H14.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 0.75V8.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPlay({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.25 8L1.75 1.75V14.25L14.25 8Z"
        fill={color}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPlus({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 1.75V14.25"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M14.25 8H1.75"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function IconPoll({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.75 3H15.25M8.75 13H15.25M3 5.25C2.70453 5.25 2.41194 5.1918 2.13896 5.07873C1.86598 4.96566 1.61794 4.79992 1.40901 4.59099C1.20008 4.38206 1.03434 4.13402 0.921271 3.86104C0.808198 3.58806 0.75 3.29547 0.75 3C0.75 2.70453 0.808198 2.41194 0.921271 2.13896C1.03434 1.86598 1.20008 1.61794 1.40901 1.40901C1.61794 1.20008 1.86598 1.03434 2.13896 0.921271C2.41194 0.808198 2.70453 0.75 3 0.75C3.59674 0.75 4.16903 0.987053 4.59099 1.40901C5.01295 1.83097 5.25 2.40326 5.25 3C5.25 3.59674 5.01295 4.16903 4.59099 4.59099C4.16903 5.01295 3.59674 5.25 3 5.25ZM3 15.25C2.40326 15.25 1.83097 15.0129 1.40901 14.591C0.987053 14.169 0.75 13.5967 0.75 13C0.75 12.4033 0.987053 11.831 1.40901 11.409C1.83097 10.9871 2.40326 10.75 3 10.75C3.59674 10.75 4.16903 10.9871 4.59099 11.409C5.01295 11.831 5.25 12.4033 5.25 13C5.25 13.5967 5.01295 14.169 4.59099 14.591C4.16903 15.0129 3.59674 15.25 3 15.25Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPreferences({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <path d="m2.061 10.758 1.025.16c.757.12 1.297.812 1.241 1.593l-.075 1.058a.755.755 0 0 0 .414.733l.758.373a.72.72 0 0 0 .819-.125l.761-.72a1.443 1.443 0 0 1 1.99 0l.762.72c.223.21.547.26.82.125l.759-.374a.75.75 0 0 0 .413-.73l-.076-1.06c-.056-.78.485-1.474 1.241-1.592l1.025-.16a.74.74 0 0 0 .606-.577l.187-.839a.76.76 0 0 0-.3-.788l-.856-.6a1.52 1.52 0 0 1-.443-1.984l.517-.92a.77.77 0 0 0-.063-.844l-.525-.673a.73.73 0 0 0-.79-.25l-.992.31a1.46 1.46 0 0 1-1.794-.883l-.38-.985a.74.74 0 0 0-.686-.476l-.84.002a.74.74 0 0 0-.685.48l-.37.974a1.46 1.46 0 0 1-1.797.889l-1.033-.324a.73.73 0 0 0-.793.252l-.52.673a.77.77 0 0 0-.058.848l.528.922c.39.679.2 1.551-.436 1.996l-.845.592a.76.76 0 0 0-.301.789l.187.838a.74.74 0 0 0 .605.577" />
        <path d="M9.481 6.519A2.095 2.095 0 1 1 6.518 9.48 2.095 2.095 0 0 1 9.48 6.52" />
      </g>
    </svg>
  );
}

export function IconPresentation({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.75 0.75H14.25M1.75 0.75V9.25C1.75 9.78043 1.96071 10.2891 2.33579 10.6642C2.71086 11.0393 3.21957 11.25 3.75 11.25H6M1.75 0.75H0.75M14.25 0.75V9.25C14.25 9.78043 14.0393 10.2891 13.6642 10.6642C13.2891 11.0393 12.7804 11.25 12.25 11.25H10M14.25 0.75H15.25M6 11.25L4.75 15.25M6 11.25H10M10 11.25L11.25 15.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.75 8.25L7 5.75L9 8.25L11.25 3.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconProjects({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.75 12.888V5.905a1.86 1.86 0 0 0-1.862-1.862H1.25v8.845c0 1.028.834 1.862 1.862 1.862h9.776a1.86 1.86 0 0 0 1.862-1.862" />
        <path d="m9.397 3.81-.868-1.59a1.86 1.86 0 0 0-1.634-.97H3.112A1.86 1.86 0 0 0 1.25 3.112V7.07" />
      </g>
    </svg>
  );
}

export function IconProjectsCreate({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.23276 14.75H3.11207C2.08368 14.75 1.25 13.9164 1.25 12.8879V4.0431H12.8879C13.9164 4.0431 14.75 4.87678 14.75 5.90517V8.23276"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.39655 3.81034L8.52929 2.22042C8.20306 1.6222 7.57601 1.25 6.89458 1.25H3.11207C2.08368 1.25 1.25 2.08368 1.25 3.11207V7.06897"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.6552 10.5603V14.75"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.75 12.6552H10.5603"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconProjectsList({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.75 2C2.75 2.27614 2.52614 2.5 2.25 2.5C1.97386 2.5 1.75 2.27614 1.75 2C1.75 1.72386 1.97386 1.5 2.25 1.5C2.52614 1.5 2.75 1.72386 2.75 2Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.75 8C2.75 8.2761 2.52614 8.5 2.25 8.5C1.97386 8.5 1.75 8.2761 1.75 8C1.75 7.7239 1.97386 7.5 2.25 7.5C2.52614 7.5 2.75 7.7239 2.75 8Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.75 14C2.75 14.2761 2.52614 14.5 2.25 14.5C1.97386 14.5 1.75 14.2761 1.75 14C1.75 13.7239 1.97386 13.5 2.25 13.5C2.52614 13.5 2.75 13.7239 2.75 14Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.75 2H14.25"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.75 8H14.25"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.75 14H14.25"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconReadCV({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 28 28"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.737 7.958a.75.75 0 10-.389 1.45l7.245 1.94A.75.75 0 1018.98 9.9l-7.244-1.94zM10.896 11.098a.75.75 0 00-.389 1.448l7.245 1.942a.75.75 0 00.388-1.45l-7.245-1.94zM9.136 14.767a.75.75 0 01.918-.53l4.83 1.294a.75.75 0 01-.388 1.449l-4.83-1.294a.75.75 0 01-.53-.919z"
        fill={color}
      ></path>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.5 23.987L6.841 21.4a2.75 2.75 0 01-1.944-3.368L8.132 5.957A2.75 2.75 0 0111.5 4.013L21.16 6.6a2.75 2.75 0 011.944 3.368l-3.236 12.074a2.75 2.75 0 01-3.368 1.944zM6.345 18.42a1.25 1.25 0 00.884 1.531l9.66 2.588a1.25 1.25 0 001.53-.883L21.655 9.58a1.25 1.25 0 00-.884-1.531L11.11 5.46a1.25 1.25 0 00-1.53.884L6.345 18.42z"
        fill={color}
      ></path>
    </svg>
  );
}

export function IconRedo({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.75 0.75L15.25 5L10.75 9.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.25 5H4.75C2.54086 5 0.75 6.7909 0.75 9V15.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconRotate({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.1265 13.1265C10.2952 15.9578 5.70478 15.9578 2.87348 13.1265C0.0421724 10.2952 0.0421724 5.7048 2.87348 2.8735C5.70478 0.0422018 10.2952 0.0422018 13.1265 2.8735C13.7603 3.5073 14.2522 4.2292 14.6023 4.9999"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M15.25 0.75V4.25C15.25 4.8023 14.8023 5.25 14.25 5.25H10.75"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function IconRotateLeft({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.1265 2.87348C10.2952 0.0421724 5.70478 0.0421724 2.87348 2.87348C0.0421724 5.70478 0.0421724 10.2952 2.87348 13.1265C5.70478 15.9578 10.2952 15.9578 13.1265 13.1265C13.7603 12.4927 14.2522 11.7708 14.6023 11.0001"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.25 15.25V11.75C15.25 11.1977 14.8023 10.75 14.25 10.75H10.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconRotateRight({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.87347 2.87299C5.70477 0.0416868 10.2952 0.0416868 13.1265 2.87299C15.9578 5.70429 15.9578 10.2947 13.1265 13.126C10.2952 15.9573 5.70477 15.9573 2.87347 13.126C2.23967 12.4922 1.74775 11.7703 1.39771 10.9996"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.75 15.249V11.749C0.75 11.1967 1.19772 10.749 1.75 10.749H5.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSearch({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.25 15.25L11.5 11.5M0.75 7C0.75 3.54822 3.54822 0.75 7 0.75C10.4518 0.75 13.25 3.54822 13.25 7C13.25 10.4518 10.4518 13.25 7 13.25C3.54822 13.25 0.75 10.4518 0.75 7Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSecurity({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.873 6.39v-.147c0-1.464-.088-3.095.935-4.143C5.39 1.504 6.334 1 7.858 1s2.467.503 3.05 1.1c1.022 1.048.934 2.68.934 4.143v.148M2 7.563a.937.937 0 0 1 .938-.938h9.843a.94.94 0 0 1 .938.938v5.156a1.875 1.875 0 0 1-1.875 1.875H3.875A1.875 1.875 0 0 1 2 12.719z"
      />
    </svg>
  );
}

export function IconSend({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.75 0.749999L15.25 8L0.749999 15.25L4.25 8L0.75 0.749999Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 8L7.25 8"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconServer({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.25 2.181c0-.514.417-.931.931-.931h11.638c.514 0 .931.417.931.931V5.44a.93.93 0 0 1-.931.93H2.181a.93.93 0 0 1-.931-.93zM1.25 10.56c0-.514.417-.93.931-.93h11.638c.514 0 .931.416.931.93v3.259a.93.93 0 0 1-.931.931H2.181a.93.93 0 0 1-.931-.931zM11.957 1.483v4.655M11.957 9.862v4.655" />
      </g>
    </svg>
  );
}

export function IconShield({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 0.75L0.75001 4C0.75001 4 1.00136e-05 15.25 8 15.25C16 15.25 15.25 4 15.25 4L8 0.75Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSignOut({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.491 4.974 14.75 8l-3.259 3.026M14.517 8h-7.68"
      />
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.026 1.25H4.112A1.86 1.86 0 0 0 2.25 3.112v9.776c0 1.028.834 1.862 1.862 1.862h7.914"
      />
    </svg>
  );
}

export function IconSpeechBubble({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 14.25C11.866 14.25 15.25 12.1552 15.25 7.5C15.25 2.84483 11.866 0.75 8 0.75C4.13401 0.75 0.75 2.84483 0.75 7.5C0.75 9.2675 1.23783 10.6659 2.05464 11.7206C2.29358 12.0292 2.38851 12.4392 2.2231 12.7926C2.12235 13.0079 2.01633 13.2134 1.90792 13.4082C1.45369 14.2242 2.07951 15.4131 2.99526 15.2297C4.0113 15.0263 5.14752 14.722 6.0954 14.2738C6.2933 14.1803 6.5134 14.1439 6.7305 14.1714C7.145 14.224 7.5695 14.25 8 14.25Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconStorage({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <g stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <path d="M.75 7.75h14.5v6.5a1 1 0 0 1-1 1H1.75a1 1 0 0 1-1-1z" />
        <path d="M.75 10V7.907a1 1 0 0 1 .048-.306l1.979-6.157A1 1 0 0 1 3.729.75h8.542a1 1 0 0 1 .952.694l1.979 6.157a1 1 0 0 1 .048.306V10m-11.5 1.25h1.5m3.5 0h3.5" />
      </g>
    </svg>
  );
}

export function IconTag({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 6C11.5523 6 12 5.55228 12 5C12 4.44772 11.5523 4 11 4C10.4477 4 10 4.44772 10 5C10 5.55228 10.4477 6 11 6Z"
        fill={color}
      />
      <path
        d="M8.00001 0.75H15.25V8L8.55351 14.6708C7.75441 15.4668 6.45561 15.445 5.6837 14.6226L1.28994 9.941C0.540415 9.1424 0.572655 7.8895 1.36227 7.1305L8.00001 0.75Z"
        stroke={color}
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
}

export function IconTableRows({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.75 15.2502H14.25C14.8023 15.2502 15.25 14.8025 15.25 14.2502V1.75C15.25 1.19772 14.8023 0.75 14.25 0.75H1.75C1.19772 0.75 0.75 1.19772 0.75 1.75V14.2502C0.75 14.8025 1.19772 15.2502 1.75 15.2502Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.25 5.25H1.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.25 10.75H1.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconThink({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M1.75 6.25v-.583A2.917 2.917 0 0 1 4.667 2.75H4.8a2.5 2.5 0 0 1 2.45-2H8m0 0h.75a2.5 2.5 0 0 1 2.45 2h.133a2.917 2.917 0 0 1 2.917 2.917v.583M8 .75V4m0 0v7m0-7c0 1.2-1 3-2.25 3.25m-2.5-1.5C1.87 5.75.75 6.981.75 8.5c0 .788.301 1.499.784 2q.114.119.242.221m0 0c.416.34.937.527 1.474.529h.5m-1.974-.529a2.92 2.92 0 0 0 2.89 2.529H4.8a2.5 2.5 0 0 0 2.45 2H8m0 0h.75a2.5 2.5 0 0 0 2.45-2h.133a2.92 2.92 0 0 0 2.891-2.529M8 15.25V11m6.224-.279q.128-.103.242-.221c.51-.54.79-1.257.784-2 0-1.519-1.12-2.75-2.5-2.75m1.474 4.971c-.416.34-.937.527-1.474.529h-.5M8 11c0-1.6 1.333-2.25 2-2.25h.25"
      />
    </svg>
  );
}

export function IconTrash({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.75 7.75L6.59115 17.4233C6.68102 18.4568 7.54622 19.25 8.58363 19.25H14.4164C15.4538 19.25 16.319 18.4568 16.4088 17.4233L17.25 7.75H5.75Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <path
        d="M9.75 10.75V16.25"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <path
        d="M13.25 10.75V16.25"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <path
        d="M8.75 7.75V6.75C8.75 5.64543 9.64543 4.75 10.75 4.75H12.25C13.3546 4.75 14.25 5.64543 14.25 6.75V7.75"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
      <path
        d="M4.75 7.75H18.25"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
    </svg>
  );
}

export function IconTwitter({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.31 18.25C14.7819 18.25 17.7744 13.4403 17.7744 9.26994C17.7744 9.03682 17.9396 8.83015 18.152 8.73398C18.8803 8.40413 19.8249 7.49943 18.8494 5.97828C18.2031 6.32576 17.6719 6.51562 16.9603 6.74448C15.834 5.47393 13.9495 5.41269 12.7514 6.60761C11.9785 7.37819 11.651 8.52686 11.8907 9.62304C9.49851 9.49618 6.69788 7.73566 5.1875 5.76391C4.39814 7.20632 4.80107 9.05121 6.10822 9.97802C5.63461 9.96302 5.1716 9.82741 4.75807 9.58305V9.62304C4.75807 11.1255 5.75654 12.4191 7.1444 12.7166C6.70672 12.8435 6.24724 12.8622 5.80131 12.771C6.19128 14.0565 7.87974 15.4989 9.15272 15.5245C8.09887 16.4026 6.79761 16.8795 5.45806 16.8782C5.22126 16.8776 4.98504 16.8626 4.75 16.8326C6.11076 17.7588 7.69359 18.25 9.31 18.2475V18.25Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
}

export function IconWifiNoConnection({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 14.65C8.55228 14.65 9 14.2023 9 13.65C9 13.0977 8.55228 12.65 8 12.65C7.44772 12.65 7 13.0977 7 13.65C7 14.2023 7.44772 14.65 8 14.65Z"
        fill={color}
      />
      <path
        d="M5.5 10.2127C6.2016 9.70159 7.0656 9.39999 8 9.39999C8.9344 9.39999 9.7984 9.70159 10.5 10.2127"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.7128 6.87769C11.952 6.34729 11.0976 5.94179 10.1794 5.69099M3.2876 6.87769C4.19156 6.24749 5.22762 5.79359 6.3459 5.56601"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.75 3.89999C2.73421 2.51596 5 1.39999 8 1.39999C8.6875 1.39999 9.3364 1.45859 9.9522 1.56559M15.25 3.89999C14.6425 3.47627 14.0087 3.07767 13.3354 2.72853"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.25 1.39999L2.75 12.9"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconWrench({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 16 16"
    >
      <path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.295 5.16a.93.93 0 0 1 0-1.317L12.5 1.637a3.957 3.957 0 0 0-5.278 5.278l-5.587 5.587a1.317 1.317 0 1 0 1.862 1.862l5.587-5.587a3.957 3.957 0 0 0 5.288-5.259L12.17 5.72a.93.93 0 0 1-1.317 0z"
      />
    </svg>
  );
}

export function IconWriteNote({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.25 11.75V12.25C13.25 13.9069 11.9069 15.25 10.25 15.25H3.75C2.09315 15.25 0.75 13.9069 0.75 12.25V3.75C0.75 2.09315 2.09315 0.75 3.75 0.75H6.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.75001 8.25L7.02241 8.0681C6.95851 8.3237 7.03341 8.594 7.21971 8.7803C7.40601 8.9666 7.67631 9.0415 7.93191 8.9776L7.75001 8.25ZM14.2088 3.1973L10.9257 6.4804L11.9863 7.5411L15.2695 4.25796L14.2088 3.1973ZM10.285 6.8432L7.56811 7.5224L7.93191 8.9776L10.6488 8.2984L10.285 6.8432ZM8.47761 8.4319L9.15681 5.71502L7.70161 5.35122L7.02241 8.0681L8.47761 8.4319ZM9.51961 5.07433L12.8027 1.79121L11.742 0.730552L8.45891 4.01367L9.51961 5.07433ZM9.15681 5.71502C9.21741 5.47253 9.34281 5.25108 9.51961 5.07433L8.45891 4.01367C8.08991 4.38265 7.82821 4.84498 7.70161 5.35122L9.15681 5.71502ZM10.9257 6.4804C10.7489 6.6572 10.5275 6.7826 10.285 6.8432L10.6488 8.2984C11.155 8.1718 11.6173 7.9101 11.9863 7.5411L10.9257 6.4804ZM14.2088 1.79121C14.5971 2.17949 14.5971 2.80902 14.2088 3.1973L15.2695 4.25796C16.2435 3.28389 16.2435 1.70462 15.2694 0.730552L14.2088 1.79121ZM15.2694 0.730552C14.2954 -0.243518 12.7161 -0.243518 11.742 0.730552L12.8027 1.79121C13.191 1.40293 13.8205 1.40293 14.2088 1.79121L15.2694 0.730552Z"
        fill={color}
      />
      <path
        d="M3.75 11.25H10.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75 8.25H5.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75 5.25H5.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUndo({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.25 0.75L0.75 5L5.25 9.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.5 5H11.25C13.4591 5 15.25 6.7909 15.25 9V15.25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUnorderedList({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.625 2C2.625 2.27614 2.40114 2.5 2.125 2.5C1.84886 2.5 1.625 2.27614 1.625 2C1.625 1.72386 1.84886 1.5 2.125 1.5C2.40114 1.5 2.625 1.72386 2.625 2Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.625 8C2.625 8.2761 2.40114 8.5 2.125 8.5C1.84886 8.5 1.625 8.2761 1.625 8C1.625 7.7239 1.84886 7.5 2.125 7.5C2.40114 7.5 2.625 7.7239 2.625 8Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.625 14C2.625 14.2761 2.40114 14.5 2.125 14.5C1.84886 14.5 1.625 14.2761 1.625 14C1.625 13.7239 1.84886 13.5 2.125 13.5C2.40114 13.5 2.625 13.7239 2.625 14Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.875 2H14.375"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.875 8H14.375"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.875 14H14.375"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUser({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 7.25C9.79493 7.25 11.25 5.79493 11.25 4C11.25 2.20507 9.79493 0.75 8 0.75C6.20507 0.75 4.75 2.20507 4.75 4C4.75 5.79493 6.20507 7.25 8 7.25Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.8475 15.25H13.1525C14.2944 15.25 15.174 14.2681 14.6408 13.2584C13.8563 11.7731 12.068 10 8 10C3.93201 10 2.14367 11.7731 1.35924 13.2584C0.82597 14.2681 1.70558 15.25 2.8475 15.25Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUsers({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.81372 15.25H9.25034C9.81484 15.25 10.259 14.7817 10.1465 14.2285C9.83604 12.7012 8.82174 10 5.53204 10C2.24235 10 1.22809 12.7012 0.917528 14.2285C0.805038 14.7817 1.24922 15.25 1.81372 15.25Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.782 10C13.8608 10 14.7122 12.1479 15.0559 13.696C15.2415 14.532 14.5653 15.25 13.7089 15.25H12.782"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.53204 6.25C7.05082 6.25 8.28204 5.01878 8.28204 3.5C8.28204 1.98122 7.05082 0.75 5.53204 0.75C4.01326 0.75 2.78204 1.98122 2.78204 3.5C2.78204 5.01878 4.01326 6.25 5.53204 6.25Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.782 6.25C12.3008 6.25 13.282 5.01878 13.282 3.5C13.282 1.98122 12.3008 0.75 10.782 0.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconVPN({
  color = "currentColor",
  height = 24,
  width = 24,
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.75 11.25V4.75L15.25 11.25V4.75M6.75 11.25V8.25M6.75 8.25V4.75H8.25C8.8023 4.75 9.25 5.19772 9.25 5.75V7.25C9.25 7.8023 8.8023 8.25 8.25 8.25H6.75ZM0.75 4.75L2.5 11.25L4.25 4.75"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// --- Company Logos -------------------------------------------------------------
type MarkFills =
  | { primary: string } // one-color mark
  | { primary: string; secondary: string }; // two-color mark

type FillDefaults = {
  brand: { typeFill: string; mark: MarkFills };
  gray: { typeFill: string; mark: MarkFills };
};

type Variant = "default" | "currentColor" | "gray";

type FillOverrides = {
  logoTypeFill?: string;
  logoMarkPrimaryFill?: string;
  logoMarkSecondaryFill?: string; // optional even for two-tone marks
};

function createResolveFills(defaults: FillDefaults) {
  return function resolveFills(
    variant: Variant,
    overrides: FillOverrides = {},
  ) {
    if (variant === "currentColor") {
      return {
        typeFill: "currentColor",
        markPrimaryFill: "currentColor",
        markSecondaryFill: "currentColor" as string | undefined,
      };
    }

    const base = variant === "gray" ? defaults.gray : defaults.brand;

    const markPrimaryFill = overrides.logoMarkPrimaryFill ?? base.mark.primary;

    // Only return secondary if either:
    // - the base mark is two-tone, or
    // - the caller explicitly provides a secondary override
    const baseSecondary =
      "secondary" in base.mark ? base.mark.secondary : undefined;

    const markSecondaryFill = overrides.logoMarkSecondaryFill ?? baseSecondary;

    return {
      typeFill: overrides.logoTypeFill ?? base.typeFill,
      markPrimaryFill,
      markSecondaryFill, // may be undefined for single-color marks
    };
  };
}

// --- Capital One -------------------------------------------------------------
type LogoCapitalOneProps = Omit<IconProps, "color"> & {
  variant?: "default" | "currentColor" | "gray";
  /**
   * Optional overrides (apply for variant "default" or "gray")
   * For "currentColor", these are ignored.
   */
  logoTypeFill?: string;
  logoMarkFill?: string;
};

const resolveCapitalOneFills = createResolveFills({
  brand: { typeFill: "#003366", mark: { primary: "#D03027" } },
  gray: { typeFill: "var(--gray-10)", mark: { primary: "var(--gray-9)" } },
});

export function LogoCapitalOne({
  width = 224,
  height = 80,
  variant = "default",
  logoTypeFill,
  logoMarkFill,
  ...rest
}: LogoCapitalOneProps) {
  const { typeFill, markPrimaryFill } = resolveCapitalOneFills(variant, {
    logoTypeFill,
    logoMarkPrimaryFill: logoMarkFill,
  });
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 224 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <g>
        {/* Logotype */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M27.9024 52.5235C24.9837 53.1194 23.3327 53.328 20.4435 53.328C16.1392 53.328 12.7193 51.1826 12.9256 47.2196C13.0436 44.5975 16.1392 39.0254 23.9813 39.0254C26.4578 39.0254 28.3741 39.4724 30.9685 40.9622L32.1183 34.4963C28.5805 33.1555 26.2514 32.9469 23.2148 32.9767C12.9256 33.0959 3.04922 37.8038 1.84046 47.4282C0.602226 57.2016 12.395 59.6449 17.6133 59.6151C20.6499 59.6151 23.775 59.4959 26.7232 59.1682L27.9024 52.5235Z"
          fill={typeFill}
        />

        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M46.8591 50.6163C46.4464 50.7653 45.9452 50.9143 45.2966 51.0633C44.648 51.2123 43.4982 51.4208 41.8177 51.689C40.6679 51.8678 39.8424 52.1062 39.4002 52.4637C38.958 52.7915 38.6927 53.1789 38.6337 53.6556C38.5452 54.1622 38.7221 54.5793 39.1349 54.9071C39.5771 55.2348 40.3142 55.3838 41.3755 55.3838C42.1715 55.3838 42.938 55.2646 43.7046 55.0263C44.4711 54.7879 45.0902 54.4303 45.5914 54.0132C45.9452 53.6854 46.2105 53.298 46.4169 52.8213C46.5053 52.4637 46.6822 51.7486 46.8591 50.6163ZM56.5587 44.5079C56.5292 45.4317 56.3523 46.2064 56.1164 47.6068L54.4654 56.9035C54.318 57.7378 54.6423 58.3933 55.3794 58.8105L55.3204 59.168H45.9157L45.8273 56.8141C44.4711 57.6484 42.8201 58.3635 41.3165 58.7509C39.8424 59.1382 38.6337 59.317 36.8058 59.317C33.7692 59.317 32.0297 58.9893 30.821 57.9464C29.6122 56.8439 29.0226 56.1287 29.0816 54.6091C29.1405 53.745 29.5828 52.6425 30.2314 51.838C30.88 51.0335 31.7644 50.5269 32.7373 50.08C33.7102 49.6032 34.86 49.2755 36.511 49.0073C38.162 48.7391 40.491 48.4709 43.5866 48.2028C45.2081 48.0538 46.2105 47.6962 46.6822 47.4876C47.3308 47.2195 47.5962 46.9513 47.6846 46.4149C47.8615 45.4614 47.5667 44.9251 46.299 44.6569C42.9086 43.9716 36.57 45.1039 33.2975 45.9084L35.0664 41.0515C39.3707 40.4258 43.4097 40.0086 47.6846 40.0086C54.4654 40.0682 56.6176 42.005 56.5587 44.5079Z"
          fill={typeFill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M71.889 44.9548C70.7097 44.9548 69.6484 45.3123 68.7049 46.0275C67.7615 46.7426 67.1719 47.8153 66.936 49.2157C66.6412 50.8248 66.8181 52.0166 67.4667 52.7318C68.1153 53.4469 69.0293 53.8045 70.238 53.8045C71.0635 53.8045 71.9185 53.6555 72.5376 53.3575C73.3041 52.9403 73.8348 52.5232 74.3065 51.8379C74.8077 51.1227 75.132 50.3182 75.3089 49.3945C75.5742 47.9345 75.3384 46.832 74.6603 46.0871C73.9822 45.3421 73.0683 44.9548 71.889 44.9548ZM55.4971 65.6338L59.8899 40.6938H67.791L67.1719 43.8821C67.85 42.9286 68.9408 42.1539 70.4739 41.5281C72.0069 40.9024 73.7169 40.4256 75.5742 40.4256C77.6379 40.4256 78.9057 40.5448 80.4387 41.3493C81.9718 42.1539 83.0331 43.3457 83.6228 44.8654C84.2124 46.385 84.3303 48.0834 84.006 49.9309C83.4754 52.9999 82.0013 55.4135 79.5543 57.2013C77.1368 58.9891 74.9846 59.4361 71.8595 59.4659C70.7687 59.4659 69.8547 59.3467 69.0882 59.1679C68.3512 58.9593 67.7615 58.7209 67.2898 58.4528C66.8476 58.1548 66.4054 57.7377 65.8157 57.1119L64.3416 65.6636H55.4971V65.6338Z"
          fill={typeFill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M83.7995 59.1978L87.072 40.6045H96.0345L92.7915 59.1978H83.7995ZM87.5437 36.2839C87.8091 34.7643 90.1971 33.5128 92.88 33.5128C95.5628 33.5128 97.5086 34.7643 97.2433 36.2839C96.9485 37.8036 94.5899 39.055 91.9071 39.055C89.2242 39.055 87.2784 37.8334 87.5437 36.2839Z"
          fill={typeFill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M101.016 40.4853L101.665 36.7011L111.07 34.6451L110.067 40.5151H114.666L113.782 44.2695H109.301L106.588 59.2275C106.588 59.2275 97.5375 59.1679 97.508 59.2275L100.22 44.2993H96.8005L97.508 40.5151H101.016V40.4853Z"
          fill={typeFill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M127.993 50.6463C127.58 50.7953 127.079 50.9443 126.43 51.0933C125.811 51.2423 124.632 51.4211 122.922 51.719C121.772 51.8978 120.947 52.1362 120.504 52.4938C120.062 52.8215 119.826 53.2089 119.738 53.6856C119.649 54.1922 119.826 54.6093 120.239 54.9371C120.681 55.2649 121.448 55.4139 122.509 55.4139C123.305 55.4139 124.072 55.2947 124.809 55.0563C125.575 54.7881 126.224 54.4604 126.695 54.0432C127.049 53.7154 127.315 53.3281 127.491 52.8215C127.639 52.4938 127.786 51.7786 127.993 50.6463ZM137.692 44.538C137.663 45.4617 137.486 46.2662 137.25 47.6369L135.628 56.9633C135.481 57.7976 135.776 58.4233 136.542 58.9001L136.483 59.2279L127.079 59.2577L127.02 56.8739C125.634 57.7082 123.983 58.4233 122.509 58.8107C121.005 59.1981 119.797 59.3768 117.998 59.3768C114.962 59.3768 113.252 59.0789 112.043 58.0062C110.805 56.9037 110.215 56.1886 110.304 54.6689C110.333 53.8048 110.775 52.6725 111.424 51.8978C112.072 51.0933 112.957 50.5868 113.93 50.1398C114.903 49.663 116.053 49.3353 117.674 49.0671C119.355 48.7989 121.654 48.5308 124.75 48.2626C126.371 48.1136 127.344 47.756 127.816 47.5773C128.464 47.3091 128.73 47.0409 128.818 46.5046C128.995 45.5809 128.7 45.0147 127.433 44.7466C124.042 44.0612 117.704 45.1935 114.431 45.998L116.2 41.1411C120.534 40.5154 124.543 40.0982 128.818 40.0982C135.599 40.0982 137.751 42.0648 137.692 44.538Z"
          fill={typeFill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M146.832 59.198H137.663L142.262 33.2449L151.195 33.5131L146.832 59.198Z"
          fill={typeFill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M157.386 53.5362C157.592 59.3466 161.219 64.0843 165.965 64.0843C175.164 64.0843 179.055 52.6721 178.79 45.0739C178.584 39.2635 174.869 34.496 170.122 34.496C162.221 34.5258 157.121 45.8784 157.386 53.5362ZM152.551 53.2383C152.197 43.3159 159.892 33.1849 171.036 33.1849C178.495 33.1849 183.389 38.2206 183.654 45.9082C184.008 56.3669 176.844 65.9615 165.169 65.9615C157.71 65.9615 152.816 60.9259 152.551 53.2383Z"
          fill={typeFill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M183.537 47.041C184.156 46.9516 185.158 46.8325 185.601 46.8325C186.249 46.8325 186.898 46.9516 186.927 47.6072C186.927 47.9945 186.249 50.8252 186.102 51.4808L184.687 57.7381C184.126 60.3007 183.507 62.9824 182.947 65.098H186.544L188.578 55.2054C194.769 48.6799 197.128 46.5643 198.602 46.5643C199.251 46.5643 199.722 46.9218 199.752 47.6966C199.781 48.8289 199.074 51.451 198.838 52.1959L196.774 59.4068C196.302 61.0158 195.949 62.5056 195.978 63.5485C196.037 65.1278 196.981 65.8429 198.396 65.8429C201.02 65.8429 202.936 63.0718 204.616 60.3305L204.115 59.4366C203.437 60.539 201.875 62.9228 200.636 62.9228C200.253 62.9228 199.87 62.6546 199.87 61.9991C199.84 61.1648 200.194 59.8835 200.43 59.0492L202.729 50.5869C203.349 48.2627 203.643 46.7431 203.614 45.9683C203.555 44.3891 202.641 43.6442 201.255 43.6442C198.897 43.6442 195.742 45.4022 189.079 53.1494H188.991L189.816 49.3652C190.259 47.3092 190.73 45.134 191.143 43.6442C188.844 44.4785 185.542 45.432 183.478 45.8194L183.537 47.041Z"
          fill={typeFill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M218.826 47.2496C218.767 45.7598 218.03 44.7467 216.497 44.7467C212.812 44.7467 208.891 52.0469 208.213 54.9968C214.256 54.9968 218.974 51.3616 218.826 47.2496ZM219.622 58.6916L220.33 59.1684C218.531 62.8632 214.846 65.8429 210.571 65.8429C207.063 65.8429 204.174 63.4591 203.997 59.0194C203.702 51.0338 211.102 43.6442 217.146 43.6442C219.74 43.6442 222.158 44.8063 222.246 47.6072C222.482 53.9539 213.667 55.8907 207.859 56.0099C207.682 56.6654 207.594 57.3508 207.623 58.3639C207.711 60.986 209.303 63.191 212.546 63.191C215.377 63.2506 218.207 60.9562 219.622 58.6916Z"
          fill={typeFill}
        />

        {/* Logomark */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M151.402 57.8571C151.402 57.8571 151.372 57.8571 151.372 57.8869C141.997 64.621 130.853 71.6531 118.883 79.0725L118.412 79.3407C118.264 79.4599 118.205 79.6684 118.323 79.8472C118.441 79.9962 118.647 80.0558 118.824 79.9366L119.237 79.728C129.379 74.3646 141.054 68.0178 152.758 61.4923C152.817 61.4625 152.876 61.4327 152.935 61.3731C152.316 60.3302 151.785 59.1682 151.402 57.8571ZM213.048 7.4407C198.249 -9.06679 102.993 5.77208 62.4846 14.7112L61.5411 14.9197C61.3348 14.9495 61.2168 15.1581 61.2463 15.3369C61.2758 15.5455 61.4527 15.6647 61.6591 15.6349L62.6025 15.4561C96.1528 9.4073 165.936 1.03436 180.972 16.0818C185.542 20.6705 184.451 26.6001 179.144 33.5726C182.004 35.42 184.038 38.3699 184.952 42.0051C205.707 28.09 219.652 14.8005 213.048 7.4407Z"
          fill={markPrimaryFill}
        />
      </g>
    </svg>
  );
}
// ---------------------------------------------------------------------------

// --- Cloudflare -------------------------------------------------------------
type LogoCloudflareProps = Omit<IconProps, "color"> & {
  variant?: "default" | "currentColor" | "gray";
  /**
   * Optional overrides (apply for variant "default" or "gray")
   * For "currentColor", these are ignored.
   */
  logoTypeFill?: string;
  logoMarkPrimaryFill?: string;
  logoMarkSecondaryFill?: string;
};

const resolveCloudflareFills = createResolveFills({
  brand: {
    typeFill: "#000000",
    mark: { primary: "#F6821F", secondary: "#FBAD41" },
  },
  gray: {
    typeFill: "var(--gray-10)",
    mark: { primary: "var(--gray-9)", secondary: "var(--gray-10)" },
  },
});

export function LogoCloudflare({
  width = 424,
  height = 80,
  variant = "default",
  logoTypeFill,
  logoMarkPrimaryFill,
  logoMarkSecondaryFill,
  ...rest
}: LogoCloudflareProps) {
  const { typeFill, markPrimaryFill, markSecondaryFill } =
    resolveCloudflareFills(variant, {
      logoTypeFill,
      logoMarkPrimaryFill,
      logoMarkSecondaryFill,
    });
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 424 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M93.8995 76.4121C94.7401 73.5315 94.4196 70.8906 93.0193 68.9306C91.7395 67.1302 89.5786 66.0896 86.9781 65.9696L37.7282 65.3298C37.4078 65.3298 37.1281 65.1694 36.9677 64.9297C36.8076 64.6897 36.7676 64.3692 36.8477 64.0496C37.0077 63.5691 37.4878 63.2094 38.0079 63.169L87.6982 62.5292C93.5794 62.2492 99.9808 57.4882 102.221 51.647L105.062 44.2455C105.182 43.9254 105.222 43.6053 105.142 43.2852C101.942 28.8022 89.0185 18 73.5753 18C59.3327 18 47.2498 27.2019 42.9293 39.9642C40.1287 37.8841 36.5676 36.7635 32.7272 37.124C25.8854 37.8041 20.4042 43.2853 19.7245 50.1267C19.5641 51.887 19.6841 53.6074 20.0842 55.2077C8.92225 55.5278 0 64.6497 0 75.8916C0 76.8918 0.0800166 77.892 0.200042 78.8922C0.280058 79.3723 0.680141 79.7328 1.16024 79.7328H92.0591C92.5792 79.7328 93.0593 79.3723 93.2194 78.8526L93.8995 76.4121Z"
        fill={markPrimaryFill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M109.583 44.7653C109.143 44.7653 108.663 44.7653 108.223 44.8053C107.903 44.8053 107.622 45.0454 107.502 45.3654L105.582 52.0468C104.742 54.9274 105.062 57.568 106.462 59.5284C107.743 61.3288 109.903 62.369 112.503 62.489L122.986 63.1291C123.306 63.1291 123.586 63.2892 123.746 63.5292C123.906 63.7693 123.946 64.1293 123.866 64.4094C123.706 64.8895 123.226 65.2496 122.706 65.2896L111.783 65.9297C105.862 66.2102 99.5008 70.9708 97.2603 76.8124L96.4602 78.8524C96.3001 79.2525 96.5802 79.6526 97.0203 79.6526H134.548C134.988 79.6526 135.388 79.3725 135.508 78.9324C136.148 76.6123 136.508 74.1714 136.508 71.6509C136.508 56.8478 124.426 44.7653 109.583 44.7653Z"
        fill={markSecondaryFill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M163.706 70.6189C162.826 72.5789 160.985 73.9792 158.585 73.9792C155.184 73.9792 152.864 71.139 152.864 67.9384V67.8584C152.864 64.6177 155.144 61.8571 158.545 61.8571C161.105 61.8571 163.066 63.4174 163.866 65.5775H170.427C169.387 60.2168 164.666 56.256 158.585 56.256C151.663 56.256 146.462 61.4966 146.462 67.9384V68.0184C146.462 74.4597 151.583 79.6208 158.505 79.6208C164.426 79.6208 169.067 75.7796 170.267 70.6589L163.706 70.6189Z"
        fill={typeFill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M177.309 56.6957H183.55V73.6993H194.393V79.1408H177.309V56.6957Z"
        fill={typeFill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M218.677 67.9781V67.8981C218.677 64.6574 216.357 61.8569 212.916 61.8569C209.515 61.8569 207.235 64.6178 207.235 67.8581V67.9381C207.235 71.1788 209.555 73.9794 212.956 73.9794C216.397 73.9794 218.677 71.2192 218.677 67.9781M200.833 67.9781V67.8981C200.833 61.4568 206.035 56.2161 212.956 56.2161C219.877 56.2161 224.999 61.3768 224.999 67.8185V67.8981C224.999 74.3395 219.797 79.5805 212.876 79.5805C205.955 79.5805 200.833 74.4199 200.833 67.9781"
        fill={typeFill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M232.64 69.2984V56.6957H238.961V69.1783C238.961 72.4194 240.602 73.9397 243.082 73.9397C245.563 73.9397 247.203 72.459 247.203 69.3388V56.6957H253.524V69.1387C253.524 76.3798 249.403 79.5409 243.002 79.5409C236.641 79.5409 232.64 76.3402 232.64 69.2984"
        fill={typeFill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M271.808 73.6196C275.529 73.6196 278.009 71.5787 278.009 67.9384V67.8584C278.009 64.2576 275.529 62.1768 271.808 62.1768H269.288V73.5792H271.808V73.6196ZM263.047 56.6956H271.688C279.69 56.6956 284.371 61.2966 284.371 67.778V67.8584C284.371 74.3397 279.65 79.1407 271.568 79.1407H263.047V56.6956Z"
        fill={typeFill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M293.413 56.6957H311.377V62.1373H299.614V65.9777H310.257V71.1391H299.614V79.1408H293.413V56.6957Z"
        fill={typeFill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M320.019 56.6957H326.22V73.6993H337.102V79.1408H320.019V56.6957Z"
        fill={typeFill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M358.827 70.2986L356.346 63.9376L353.826 70.2986H358.827ZM353.346 56.5361H359.347L368.909 79.1408H362.227L360.587 75.14H351.945L350.345 79.1408H343.824L353.346 56.5361Z"
        fill={typeFill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M387.233 67.4581C389.353 67.4581 390.553 66.4179 390.553 64.8175V64.7375C390.553 62.9772 389.273 62.097 387.193 62.097H383.112V67.4581H387.233ZM376.91 56.6959H387.512C390.953 56.6959 393.314 57.576 394.834 59.1364C396.154 60.4166 396.834 62.137 396.834 64.3775V64.4575C396.834 67.8982 394.994 70.1787 392.233 71.3389L397.595 79.1805H390.393L385.873 72.3791H383.152V79.1805H376.91V56.6959Z"
        fill={typeFill}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M405.796 56.6957H423.84V61.9768H411.957V65.3775H422.72V70.2986H411.957V73.8593H424V79.1408H405.796V56.6957Z"
        fill={typeFill}
      />
    </svg>
  );
}
// ---------------------------------------------------------------------------

// --- Docker -------------------------------------------------------------
type LogoDockerProps = Omit<IconProps, "color"> & {
  variant?: "default" | "currentColor" | "gray";
  /**
   * Optional overrides (apply for variant "default" or "gray")
   * For "currentColor", these are ignored.
   */
  logoTypeFill?: string;
  logoMarkFill?: string;
};

const resolveDockerFills = createResolveFills({
  brand: { typeFill: "#1D63ED", mark: { primary: "#1D63ED" } },
  gray: { typeFill: "var(--gray-10)", mark: { primary: "var(--gray-9)" } },
});

export function LogoDocker({
  width = 352,
  height = 80,
  variant = "default",
  logoTypeFill,
  logoMarkFill,
  ...rest
}: LogoDockerProps) {
  const { typeFill, markPrimaryFill } = resolveDockerFills(variant, {
    logoTypeFill,
    logoMarkPrimaryFill: logoMarkFill,
  });
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 352 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="M101.059 33.2595C98.5943 31.6006 92.1196 30.8933 87.4125 32.1605C87.1593 27.4713 84.741 23.5192 80.3168 20.0733L78.6803 18.9744L77.5888 20.6228C75.4444 23.878 74.5405 28.2173 74.8592 32.162C75.1124 34.5922 75.9567 37.3233 77.5888 39.3053C71.461 42.8598 65.8143 42.0527 40.803 42.0527H2.18869C2.07551 47.701 2.98388 58.5641 9.8919 67.408C10.6543 68.3848 11.4912 69.3304 12.3996 70.2403C18.0165 75.8647 26.503 79.9896 39.1933 80C58.5519 80.0178 75.1392 69.5523 85.2294 44.2507C88.5502 44.3058 97.3136 44.8448 101.602 36.5579C101.707 36.4179 102.694 34.3599 102.694 34.3599L101.059 33.261V33.2595ZM27.3891 27.4311H16.5304V38.2897H27.3891V27.4311ZM41.4181 27.4311H30.5594V38.2897H41.4181V27.4311ZM55.4471 27.4311H44.5884V38.2897H55.4471V27.4311ZM69.4761 27.4311H58.6174V38.2897H69.4761V27.4311ZM13.363 27.4311H2.5014V38.2897H13.3601V27.4311H13.363ZM27.392 13.7148H16.5334V24.5735H27.392V13.7148ZM41.421 13.7148H30.5624V24.5735H41.421V13.7148ZM55.45 13.7148H44.5914V24.5735H55.45V13.7148ZM55.4456 0H44.5869V10.8587H55.4456V0Z"
          fill={markPrimaryFill}
        />
        {/* d */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M153.72 12.9077C153.007 12.2108 152.15 11.8564 151.124 11.8564C150.098 11.8564 149.217 12.2108 148.53 12.9077C147.842 13.6046 147.506 14.4981 147.506 15.5628V33.3429C143.977 30.4257 139.904 28.9544 135.271 28.9544C129.887 28.9544 125.282 30.8992 121.467 34.8022C117.652 38.6918 115.758 43.3974 115.758 48.9161C115.758 54.4348 117.665 59.127 121.467 63.03C125.282 66.9196 129.875 68.8777 135.271 68.8777C140.668 68.8777 145.21 66.933 149.075 63.03C152.891 59.1791 154.785 54.475 154.785 48.9161V15.5613C154.785 14.4966 154.435 13.6031 153.72 12.9062V12.9077ZM146.545 53.7528V53.726C147.181 52.2279 147.506 50.6107 147.506 48.9027C147.506 47.1947 147.181 45.5909 146.545 44.0794C145.91 42.5814 145.04 41.2546 143.938 40.1109C142.836 38.9673 141.551 38.0738 140.059 37.4037C138.567 36.7336 137.009 36.4045 135.285 36.4045C133.56 36.4045 131.964 36.7336 130.472 37.4037C128.993 38.0738 127.696 38.9673 126.606 40.0975C125.518 41.2278 124.648 42.5412 124.012 44.066C123.376 45.5909 123.052 47.2066 123.052 48.9161C123.052 50.6256 123.376 52.2413 124.012 53.7662C124.648 55.2776 125.516 56.6044 126.606 57.7347C127.695 58.8649 128.98 59.7584 130.472 60.4285C131.964 61.0986 133.586 61.4277 135.285 61.4277C136.984 61.4277 138.567 61.0986 140.059 60.4285C141.538 59.7584 142.836 58.8649 143.938 57.7213C145.04 56.591 145.91 55.2642 146.545 53.7528Z"
          fill={typeFill}
        />
        {/* o */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M196.507 41.2665C195.56 38.9137 194.145 36.7589 192.239 34.8141C188.387 30.9245 183.781 28.9664 178.435 28.9664C173.089 28.9664 168.446 30.9111 164.631 34.8141C160.816 38.7037 158.923 43.4093 158.923 48.928C158.923 54.4467 160.831 59.1389 164.631 63.0419C168.446 66.9315 173.038 68.8897 178.435 68.8897C183.831 68.8897 188.373 66.9449 192.239 63.0419C196.054 59.191 197.948 54.4869 197.948 48.928C197.922 46.1687 197.442 43.6193 196.508 41.2665H196.507ZM189.709 53.7513V53.7245C190.345 52.2264 190.67 50.6092 190.67 48.9012C190.67 47.1932 190.345 45.5894 189.709 44.0779C189.073 42.5799 188.204 41.2531 187.102 40.1094C186 38.9658 184.715 38.0723 183.222 37.4022C181.73 36.7321 180.173 36.403 178.448 36.403C176.724 36.403 175.128 36.7321 173.635 37.4022C172.157 38.0723 170.86 38.9658 169.77 40.096C168.681 41.2263 167.812 42.5397 167.176 44.0645C166.54 45.5894 166.215 47.2051 166.215 48.9146C166.215 50.6241 166.54 52.2398 167.176 53.7647C167.812 55.2761 168.68 56.6029 169.77 57.7332C170.858 58.8634 172.143 59.7569 173.635 60.427C175.128 61.0971 176.749 61.4262 178.448 61.4262C180.147 61.4262 181.744 61.0971 183.222 60.427C184.701 59.7569 186 58.8634 187.102 57.7198C188.204 56.5895 189.073 55.2627 189.709 53.7513Z"
          fill={typeFill}
        />
        {/* c */}
        <path
          d="M216.774 37.4022C215.282 38.0467 213.984 38.9397 212.869 40.0692V40.0782C211.753 41.2084 210.871 42.5218 210.235 44.0467C209.599 45.5715 209.275 47.2006 209.275 48.9355C209.275 50.6703 209.599 52.2994 210.235 53.8242C210.871 55.3357 211.754 56.6759 212.869 57.7927C213.986 58.9096 215.283 59.803 216.775 60.4598C218.267 61.1165 219.85 61.4455 221.549 61.4455C223.094 61.4455 224.508 61.1954 225.805 60.6831C227.116 60.1709 228.335 59.4084 229.503 58.3839C230.151 57.8851 230.917 57.623 231.799 57.5962C232.837 57.5962 233.705 57.9506 234.393 58.6475C235.08 59.3444 235.418 60.2513 235.418 61.3026C235.418 62.3539 235.027 63.2608 234.262 64.0485C230.669 67.2829 226.426 68.8986 221.548 68.8986C216.151 68.8986 211.559 66.9404 207.744 63.0508C203.944 59.1478 202.036 54.4556 202.036 48.9369C202.036 43.4183 203.929 38.7126 207.744 34.8231C211.559 30.9201 216.163 28.9753 221.548 28.9753C226.44 28.9753 230.681 30.5925 234.262 33.8254C235.105 34.5863 235.52 35.5721 235.52 36.6368C235.52 37.7015 235.184 38.595 234.496 39.3053C233.808 40.0156 232.952 40.37 231.9 40.37C231.019 40.37 230.227 40.0811 229.527 39.5168C228.347 38.5057 227.101 37.7298 225.804 37.2042C224.493 36.68 223.079 36.4164 221.548 36.4164C219.849 36.4164 218.266 36.7455 216.774 37.4022Z"
          fill={typeFill}
        />
        {/* k */}
        <path
          d="M274.258 31.2536C274.452 31.7004 274.556 32.1739 274.556 32.6728L274.555 32.6743V32.6475C274.555 33.9758 274.1 34.9616 273.167 35.6049L258.572 45.3035L273.557 62.5579C274.233 63.3189 274.57 64.187 274.57 65.1594C274.57 65.6449 274.467 66.1318 274.272 66.5785C274.077 67.0387 273.818 67.4333 273.493 67.7743C273.17 68.1153 272.78 68.3908 272.339 68.5755C271.898 68.772 271.419 68.8643 270.912 68.8643C269.94 68.8643 269.122 68.5486 268.473 67.9054L252.373 49.4149L248.117 52.2666V65.1326C248.117 66.1571 247.767 67.0387 247.054 67.7743C246.354 68.5099 245.524 68.8777 244.498 68.8777C243.472 68.8777 242.616 68.5099 241.903 67.7743C241.189 67.0387 240.839 66.1571 240.839 65.1326V15.5881C240.839 14.5368 241.189 13.6552 241.903 12.933C242.618 12.2108 243.499 11.843 244.498 11.843C245.497 11.843 246.34 12.2108 247.054 12.933C247.767 13.6567 248.117 14.5368 248.117 15.5881V43.3989L268.953 29.5337C269.523 29.1525 270.172 28.9678 270.899 28.9678C271.405 28.9678 271.885 29.0736 272.325 29.2567C272.766 29.4399 273.155 29.7169 273.48 30.0579C273.804 30.4004 274.063 30.8069 274.258 31.2536Z"
          fill={typeFill}
        />
        {/* e */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M314.934 41.2546C313.986 38.8884 312.544 36.747 310.651 34.8275L310.626 34.8141C306.772 30.9245 302.164 28.9664 296.821 28.9664C291.478 28.9664 286.831 30.9111 283.016 34.8141C279.201 38.7037 277.308 43.4093 277.308 48.928C277.308 54.4467 279.216 59.1389 283.016 63.0419C286.831 66.9315 291.425 68.8897 296.821 68.8897C301.724 68.8897 305.966 67.274 309.574 64.0411C310.273 63.3055 310.626 62.412 310.626 61.3726C310.626 60.3332 310.289 59.4144 309.6 58.7175C308.913 58.0206 308.043 57.6662 307.005 57.6662C306.099 57.693 305.293 57.9953 304.607 58.5998C303.517 59.5454 302.336 60.2691 301.052 60.7427C299.767 61.2162 298.366 61.453 296.836 61.453C295.486 61.453 294.189 61.243 292.957 60.8097C291.723 60.3764 290.57 59.7837 289.544 59.0093C288.505 58.2335 287.611 57.3147 286.846 56.2232C286.08 55.1451 285.497 53.9493 285.108 52.6359H312.704C313.727 52.6359 314.584 52.2815 315.298 51.5846C316.013 50.8877 316.363 49.9942 316.363 48.9295C316.363 46.1702 315.881 43.6074 314.937 41.2546H314.934ZM286.792 41.6358C286.027 42.7258 285.456 43.9216 285.08 45.2231H308.563C308.161 43.9097 307.574 42.7139 306.797 41.6358C306.032 40.5443 305.125 39.6255 304.085 38.8496C303.062 38.0738 301.919 37.4826 300.672 37.0493C299.429 36.616 298.148 36.406 296.821 36.406C295.495 36.406 294.211 36.616 292.954 37.0493C291.696 37.4826 290.555 38.0738 289.504 38.8496C288.466 39.6255 287.559 40.5577 286.792 41.6358Z"
          fill={typeFill}
        />
        {/* r */}
        <path
          d="M346.393 29.9522C347.378 30.32 348.196 30.8203 348.845 31.4636H348.835C349.483 32.1084 349.807 32.9363 349.807 33.9609C349.807 34.4865 349.703 34.9735 349.508 35.4202C349.313 35.8803 349.055 36.275 348.731 36.616C348.406 36.957 348.016 37.2205 347.575 37.4171C347.134 37.6137 346.655 37.706 346.148 37.706C345.708 37.706 345.2 37.575 344.618 37.3114C343.149 36.7202 341.544 36.4179 339.844 36.4179C338.143 36.4179 336.559 36.747 335.066 37.4037C333.589 38.0485 332.292 38.942 331.187 40.0722C330.085 41.2025 329.216 42.5159 328.58 44.0407C327.944 45.5656 327.619 47.1947 327.619 48.9295V65.1862C327.619 66.1973 327.269 67.0789 326.555 67.8011C325.855 68.5233 325.027 68.8911 324.001 68.8911C322.975 68.8911 322.119 68.5233 321.407 67.8011C320.692 67.0789 320.342 66.2107 320.342 65.1862V32.6862C320.342 31.6751 320.692 30.7935 321.407 30.0713C322.119 29.3491 323.003 28.9812 324.001 28.9812C324.999 28.9812 325.843 29.3491 326.555 30.0713C327.269 30.7935 327.619 31.6617 327.619 32.6862V33.395C329.359 31.9759 331.253 30.8858 333.303 30.1234C335.352 29.361 337.531 28.9798 339.855 28.9798C340.878 28.9798 341.982 29.0453 343.149 29.1897C344.33 29.3342 345.407 29.5843 346.393 29.9522Z"
          fill={typeFill}
        />
      </g>
    </svg>
  );
}
// ---------------------------------------------------------------------------

// --- evroc -------------------------------------------------------------
type LogoEvrocProps = Omit<IconProps, "color"> & {
  variant?: "default" | "currentColor" | "gray";
  /**
   * Optional overrides (apply for variant "default" or "gray")
   * For "currentColor", these are ignored.
   */
  logoTypeFill?: string;
  logoMarkFill?: string;
};

const resolveEvrocFills = createResolveFills({
  brand: { typeFill: "#000000", mark: { primary: "#0078FF" } },
  gray: { typeFill: "var(--gray-10)", mark: { primary: "var(--gray-9)" } },
});
export function LogoEvroc({
  width = 352,
  height = 80,
  variant = "default",
  logoTypeFill,
  logoMarkFill,
  ...rest
}: LogoEvrocProps) {
  const { typeFill, markPrimaryFill } = resolveEvrocFills(variant, {
    logoTypeFill,
    logoMarkPrimaryFill: logoMarkFill,
  });
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 352 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M105.156 39.8795C105.156 36.9673 104.008 34.2975 101.912 31.9038C100.554 33.1774 98.9257 34.3753 97.0372 35.4927C98.156 36.8772 98.7666 38.3456 98.7666 39.8795C98.7666 48.8563 79.6709 55.6727 52.5774 55.6727C25.4839 55.6727 6.38818 48.8563 6.38818 39.8795C6.38818 38.3312 6.96924 36.8489 8.04874 35.4527C6.18991 34.3464 4.58512 33.1616 3.24332 31.9038C1.14766 34.2975 0 36.9673 0 39.8795C0 53.0876 23.5397 61.3187 52.5774 61.3187C81.6151 61.3187 105.156 53.0876 105.156 39.8795ZM94.1691 44.8729C91.2136 43.3514 87.7506 42.0303 83.8698 40.9349C79.3652 42.1735 74.3485 43.1221 68.9737 43.7542C76.5646 44.7063 83.1772 46.3076 88.2291 48.3861C90.733 47.3025 92.7247 46.1156 94.1691 44.8729ZM35.8982 43.719C30.6308 43.087 25.7104 42.1514 21.2857 40.9349C17.4042 42.0303 13.9419 43.3514 10.9857 44.8729C12.3895 46.0798 14.3103 47.2343 16.7143 48.2931C21.6602 46.236 28.1909 44.6526 35.8982 43.719ZM105.156 21.4392H105.153C105.153 8.22705 81.6151 0 52.5774 0C23.5404 0 0.00275231 8.22705 0.00275231 21.4392H0C0 34.6472 23.5397 42.8784 52.5774 42.8784C81.6151 42.8784 105.156 34.6472 105.156 21.4392ZM98.7666 21.4392C98.7666 30.416 79.6709 37.2324 52.5774 37.2324C25.4839 37.2324 6.38818 30.416 6.38818 21.4392H6.39163C6.39163 12.4597 25.4866 5.64396 52.5774 5.64396C78.3009 5.64396 98.7639 12.4597 98.7639 21.4392H98.7666ZM88.2312 29.8239C90.7344 28.7403 92.7261 27.5527 94.1705 26.31C84.5535 21.3607 69.5052 18.5594 52.5774 18.5594C35.6496 18.5594 20.6014 21.3607 10.985 26.31C12.3881 27.5176 14.3089 28.6721 16.7123 29.7303C24.9242 26.3156 37.5105 24.2054 52.5774 24.2054C67.0164 24.2054 79.7955 26.3527 88.2312 29.8239ZM3.24332 50.5857C1.14766 52.9795 0 55.6486 0 58.5615C0 71.7695 23.5397 80 52.5774 80C81.6151 80 105.156 71.7695 105.156 58.5615C105.156 55.6486 104.008 52.9795 101.912 50.5857C100.554 51.8587 98.9257 53.0573 97.0372 54.1746C98.156 55.5591 98.7666 57.0276 98.7666 58.5615C98.7666 67.5383 79.6709 74.354 52.5774 74.354C25.4839 74.354 6.38818 67.5383 6.38818 58.5615C6.38818 57.0124 6.96924 55.5309 8.04874 54.1347C6.18991 53.0283 4.58512 51.8435 3.24332 50.5857Z"
        fill={markPrimaryFill}
      />
      <path
        d="M134.648 36.332C135.004 29.4357 139.619 24.7494 147.071 24.7494C154.524 24.7494 158.96 29.1693 158.96 36.332H134.648ZM166.591 37.6573C166.591 26.4299 158.782 18.5602 147.16 18.5602C135.004 18.5602 127.02 26.9593 127.02 39.956C127.02 53.1276 134.915 61.4386 147.514 61.4386C157.098 61.4386 164.64 56.2229 166.06 48.7077H158.339C156.653 52.5093 152.927 54.7193 147.514 54.7193C139.708 54.7193 134.826 50.1218 134.648 42.2548H166.324C166.502 40.3085 166.591 39.4266 166.591 37.6573Z"
        fill={typeFill}
      />
      <path
        d="M185.221 60.3792H191.519L209.531 19.6219H201.279L188.865 51.7673L187.799 51.85L175.462 19.6219H167.207L185.221 60.3792Z"
        fill={typeFill}
      />
      <path
        d="M214.54 60.3793H222.257V40.6619C222.257 31.6445 226.672 26.7819 234.575 26.7819C242.479 26.7819 242.01 26.7902 242.01 26.7902L242.019 19.622H234.662C227.677 19.622 223.927 22.0047 221.945 28.1348L220.524 27.9544L222.257 19.622H214.54V60.3793Z"
        fill={typeFill}
      />
      <path
        d="M264.04 18.56C250.732 18.56 242.745 28.1103 242.745 39.9565C242.745 51.8909 250.732 61.4384 264.04 61.4384C277.262 61.4384 285.336 51.8909 285.336 39.9565C285.336 28.1103 277.262 18.56 264.04 18.56ZM264.04 54.5422C255.435 54.5422 250.376 48.1781 250.376 40.0453C250.376 31.8231 255.435 25.4563 264.04 25.4563C272.648 25.4563 277.615 31.8231 277.615 39.9565C277.615 48.1781 272.648 54.5422 264.04 54.5422Z"
        fill={typeFill}
      />
      <path
        d="M311.059 61.4386C322.149 61.4386 329.159 55.5158 330.136 46.5865H322.416C321.35 51.7135 317.448 54.5423 311.059 54.5423C303.163 54.5423 298.371 49.0629 298.371 40.0448C298.371 30.9386 303.163 25.5452 311.059 25.5452C317.448 25.5452 321.35 28.3734 322.416 33.7668H330.136C329.159 24.6606 322.149 18.649 311.059 18.649C298.46 18.649 290.74 27.4034 290.74 40.0448C290.74 52.6869 298.46 61.4386 311.059 61.4386Z"
        fill={typeFill}
      />
    </svg>
  );
}
// ---------------------------------------------------------------------------

// --- WorldRemit -------------------------------------------------------------
type LogoWorldRemitProps = Omit<IconProps, "color"> & {
  variant?: "default" | "currentColor" | "gray";
  /**
   * Optional overrides (apply for variant "default" or "gray")
   * For "currentColor", these are ignored.
   */
  logoTypeFill?: string;
  logoMarkPrimaryFill?: string;
  logoMarkSecondaryFill?: string;
};

const resolveWorldRemitFills = createResolveFills({
  brand: {
    typeFill: "#813FD6",
    mark: { primary: "#813FD6", secondary: "#813FD6" },
  },
  gray: {
    typeFill: "var(--gray-10)",
    mark: { primary: "var(--gray-9)", secondary: "var(--gray-9)" },
  },
});

export function LogoWorldRemit({
  width = 368,
  height = 80,
  variant = "default",
  logoTypeFill,
  logoMarkPrimaryFill,
  logoMarkSecondaryFill,
  ...rest
}: LogoWorldRemitProps) {
  const { typeFill, markPrimaryFill, markSecondaryFill } =
    resolveWorldRemitFills(variant, {
      logoTypeFill,
      logoMarkPrimaryFill,
      logoMarkSecondaryFill,
    });
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 368 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          opacity="0.7"
          d="M38.1774 26.5861H37.9363L34.0789 38.006L33.5968 39.3958C33.4762 39.8187 33.4762 40.3021 33.5968 40.7251L37.3939 51.8429C37.5747 52.4471 38.0569 52.8701 38.5993 53.1118L39.3226 53.3535L43.2403 41.8731L43.7827 40.3021C43.9033 39.8792 43.9033 39.3958 43.7827 38.9728L39.9856 27.9154C39.6842 27.1904 39.0212 26.6465 38.1774 26.5861ZM64.9381 25.861H56.7412C56.259 25.861 55.8371 26.1632 55.7165 26.5861L51.9194 37.7644L51.6181 38.6707C51.377 39.3354 51.377 40.0604 51.6181 40.7251L55.7165 52.7492C55.8371 53.1722 56.259 53.4743 56.7412 53.4139L57.1028 53.3535L65.9628 27.2508C66.1436 26.6465 65.8422 26.0423 65.2395 25.861C65.119 25.861 65.0587 25.861 64.9381 25.861Z"
          fill={markSecondaryFill}
        />
        <path
          d="M47.5198 2.71903C47.7006 2.71903 47.8212 2.77946 47.9417 2.83989L72.2916 16.6767C72.4724 16.7976 72.6532 16.9789 72.7135 17.2205L80.1872 44.2296C80.2475 44.4713 80.2475 44.713 80.1269 44.8942L66.3247 69.3051C66.2041 69.4864 66.0233 69.6677 65.7822 69.7281L38.8407 77.2205C38.7804 77.2205 38.6599 77.281 38.5996 77.281C38.4188 77.281 38.2982 77.2205 38.1777 77.1601L13.8278 63.3233C13.647 63.2024 13.4662 63.0211 13.4059 62.7794L5.93221 35.7704C5.87193 35.5287 5.87194 35.287 5.99248 35.1057L19.7947 10.6949C19.9153 10.5136 20.0961 10.3323 20.3372 10.2719L47.2787 2.71903C47.339 2.71903 47.4595 2.71903 47.5198 2.71903ZM47.5198 0C47.2185 0 46.8568 0.0604211 46.5555 0.120844L19.6139 7.6133C18.7098 7.85499 17.9263 8.45921 17.4441 9.30513L3.70215 33.716C3.21997 34.5619 3.09943 35.5287 3.34051 36.4955L10.8142 63.5045C11.0553 64.4109 11.658 65.1964 12.5018 65.6798L36.8517 79.5166C37.6955 80 38.6599 80.1208 39.5639 79.8792L66.5055 72.3867C67.4095 72.145 68.1931 71.5408 68.6753 70.6949L82.4775 46.284C82.9597 45.4381 83.0802 44.4713 82.8391 43.565L75.3654 16.5559C75.1244 15.6495 74.5216 14.864 73.6778 14.3807L49.328 0.543803C48.7855 0.181265 48.1225 0 47.5198 0ZM38.2982 54.139H30.1012C29.6191 54.139 29.1972 53.8369 29.0766 53.4139L20.2166 27.3112C20.0358 26.707 20.3372 26.1027 20.8796 25.9214C21.0002 25.861 21.1207 25.861 21.2413 25.861H29.4382C29.9204 25.861 30.3423 26.1631 30.4629 26.5861L39.3228 52.6888C39.5037 53.2931 39.2023 53.8973 38.6599 54.0785C38.5393 54.139 38.4188 54.139 38.2982 54.139ZM56.0182 54.139H47.8814C47.3993 54.139 46.9774 53.8369 46.8568 53.4139L37.9969 27.3112C37.816 26.707 38.1174 26.1027 38.6599 25.9214C38.7804 25.861 38.9009 25.861 39.0215 25.861H47.1582C47.6404 25.861 48.0623 26.1631 48.1828 26.5861L57.0428 52.6888C57.2236 53.2931 56.9222 53.8973 56.3195 54.0785C56.2592 54.139 56.1387 54.139 56.0182 54.139Z"
          fill={markPrimaryFill}
        />
        <path
          d="M109.78 22.5981H99.9562L109.961 58.2477H119.605L125.27 38.1268L130.936 58.2477H140.519L150.404 22.5981H140.64L135.095 45.0755L128.766 22.5981H121.594L115.265 45.0755L109.78 22.5981Z"
          fill={typeFill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M147.149 45.5589C147.149 37.9456 153.176 32.0845 160.71 32.0845C168.244 32.0845 174.271 37.9456 174.271 45.5589C174.271 53.1722 168.244 59.0332 160.71 59.0332C153.237 58.9728 147.149 53.1117 147.149 45.5589ZM160.71 40.2416C163.664 40.2416 165.833 42.4169 165.833 45.5589C165.833 48.7009 163.603 50.8761 160.71 50.8761C157.817 50.8761 155.647 48.7009 155.647 45.5589C155.647 42.4169 157.757 40.2416 160.71 40.2416Z"
          fill={typeFill}
        />
        <path
          d="M192.835 41.6314V32.2658C189.4 32.2658 186.205 34.0785 185.241 37.4622V32.7492H176.803V58.1873H185.241V47.6737C185.241 42.6586 189.46 41.148 192.835 41.6314Z"
          fill={typeFill}
        />
        <path
          d="M203.624 21.0876H195.186V58.2477H203.624V21.0876Z"
          fill={typeFill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M233.097 22.5981V58.2477H224.659V55.8912C223.031 57.8247 220.681 58.9728 217.426 58.9728C210.615 58.9728 205.492 53.1722 205.492 45.4984C205.492 37.8247 210.615 32.0241 217.426 32.0241C220.681 32.0241 223.031 33.1722 224.659 35.1057V22.5377L233.097 22.5981ZM219.355 40C222.489 40 224.659 42.2356 224.659 45.5589C224.659 48.8217 222.489 51.0574 219.355 51.1178C216.221 51.1178 214.051 48.8821 214.051 45.5589C214.051 42.2356 216.221 40 219.355 40Z"
          fill={typeFill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M251.118 46.7673H247.863V58.2477H238.823V22.5981H253.047C260.279 22.5981 265.824 27.7341 265.824 34.9244C265.824 39.154 263.474 43.0815 259.797 45.0755L267.09 58.2477H257.326L251.118 46.7673ZM252.926 39.0332H247.924V30.9969H252.926C255.156 30.9969 256.723 32.6284 256.723 35.0453C256.723 37.4622 255.156 39.0936 252.926 39.0332Z"
          fill={typeFill}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M280.35 51.722C282.038 51.7824 283.725 51.1178 284.931 49.9697L291.018 54.2598C288.487 57.4622 284.629 58.9728 280.109 58.9728C271.309 58.9728 265.885 53.1117 265.885 45.5589C265.885 37.9456 271.49 32.0846 279.386 32.0846C286.98 32.0846 292.465 37.8247 292.465 45.4984C292.465 46.5861 292.344 47.6132 292.103 48.6404H274.564C275.709 51.0574 277.939 51.722 280.35 51.722ZM279.566 39.2145C281.555 39.2145 283.544 40.1208 284.328 42.7794H274.564C275.287 40.4229 277.156 39.2145 279.566 39.2145Z"
          fill={typeFill}
        />
        <path
          d="M334.173 58.2477V42.6586C334.173 36.0725 330.436 32.0846 324.65 32.145C321.154 32.145 318.864 33.4743 317.297 35.4078C315.91 33.293 313.801 32.145 310.787 32.145C307.533 32.145 305.303 33.4138 303.916 35.2265V32.8096H295.478V58.2477H303.916V44.3504C303.916 41.8126 305.061 40.0604 307.412 40.0604C309.522 40.0604 310.606 41.4501 310.606 43.6253V58.2477H319.045V44.3504C319.045 41.8126 320.129 40.0604 322.54 40.0604C324.65 40.0604 325.674 41.4501 325.674 43.6253V58.2477H334.173Z"
          fill={typeFill}
        />
        <path
          d="M343.153 21.3897C339.236 19.7583 335.197 23.5649 336.704 27.6133C337.126 28.7613 338.09 29.7281 339.236 30.2719C343.274 32.0241 347.372 28.0362 345.745 23.9879C345.263 22.8398 344.298 21.8731 343.153 21.3897Z"
          fill={typeFill}
        />
        <path
          d="M345.444 32.8096H337.006V58.2477H345.444V32.8096Z"
          fill={typeFill}
        />
        <path
          d="M359.487 48.2779V40.9063H364.791V32.8096H359.487V25.6797L351.049 28.2175V32.8096H348.096V40.9063H351.049V48.4592C351.049 56.3142 354.424 59.5166 364.791 58.2477V50.6344C361.355 50.8157 359.487 50.6948 359.487 48.2779Z"
          fill={typeFill}
        />
      </g>
    </svg>
  );
}
// ---------------------------------------------------------------------------

export function LogoMarkCapitalOne({
  width = 40,
  height = 40,
  color = "#D03027",
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1804_9287)">
        <path
          d="M1.68323 18.433C46.1347 18.2463 29.9875 36.4003 11.1102 50.3307L3 56V57L13.2103 51.7775C78.079 14.9096 48.8414 10.4061 3.17661 15.0729L0 15.5V18.433H1.68323Z"
          fill={color}
        />
      </g>
      <defs>
        <clipPath id="clip0_1804_9287">
          <rect width="56" height="56" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function LogoMarkCloudflare({
  width = 40,
  height = 40,
  colorCloudLeft = "#F6821F",
  colorCloudRight = "#FBAD41",
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M44.6465 25.9048C44.4672 25.9048 44.2716 25.9048 44.0923 25.9211C43.9619 25.9211 43.8478 26.0189 43.7989 26.1493L43.0165 28.8715C42.6742 30.0451 42.8046 31.1209 43.3751 31.9196C43.8967 32.6531 44.7769 33.0769 45.8364 33.1258L50.1071 33.3867C50.2375 33.3867 50.3516 33.4519 50.4168 33.5497C50.482 33.6475 50.4983 33.7942 50.4657 33.9083C50.4005 34.1039 50.2049 34.2506 49.993 34.2669L45.543 34.5277C43.1306 34.6419 40.5389 36.5815 39.626 38.9615L39.3 39.7927C39.2348 39.9557 39.3489 40.1187 39.5282 40.1187H54.8179C54.9972 40.1187 55.1602 40.0046 55.2091 39.8253C55.4699 38.88 55.6166 37.8855 55.6166 36.8586C55.6166 30.8275 50.6939 25.9048 44.6465 25.9048Z"
        fill={colorCloudRight}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M38.2568 38.7984C38.5993 37.6248 38.4687 36.5488 37.8982 35.7503C37.3767 35.0168 36.4964 34.5928 35.4368 34.5439L15.3713 34.2833C15.2408 34.2833 15.1268 34.2179 15.0615 34.1202C14.9963 34.0224 14.98 33.8919 15.0126 33.7616C15.0778 33.5659 15.2734 33.4193 15.4853 33.4029L35.7303 33.1422C38.1264 33.0281 40.7344 31.0884 41.6473 28.7085L42.8046 25.693C42.8535 25.5626 42.8698 25.4322 42.8373 25.3018C41.5333 19.4011 36.2682 15 29.9762 15C24.1735 15 19.2507 18.7491 17.4904 23.9487C16.3494 23.1012 14.8985 22.6447 13.3338 22.7915C10.5463 23.0686 8.31315 25.3018 8.03621 28.0891C7.97085 28.8064 8.01975 29.5073 8.18275 30.1593C3.63513 30.2897 0 34.0061 0 38.5864C0 38.9939 0.0326006 39.4014 0.0815015 39.8089C0.114102 40.0045 0.277105 40.1514 0.472709 40.1514H37.507C37.7189 40.1514 37.9145 40.0045 37.9797 39.7928L38.2568 38.7984Z"
        fill={colorCloudLeft}
      />
    </svg>
  );
}

export function LogoMarkDocker({
  width = 40,
  height = 40,
  color = "#1D63ED",
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M55.0882 24.5298C53.7152 23.6056 50.108 23.2115 47.4855 23.9175C47.3445 21.305 45.9971 19.1032 43.5323 17.1834L42.6205 16.5711L42.0124 17.4895C40.8178 19.3031 40.3142 21.7207 40.4917 23.9183C40.6328 25.2723 41.1032 26.7938 42.0124 27.8981C38.5985 29.8784 35.4525 29.4287 21.5181 29.4287H0.00496539C-0.0580865 32.5755 0.447988 38.6277 4.29664 43.5548C4.72141 44.0991 5.18766 44.6259 5.69374 45.1328C8.8231 48.2663 13.5512 50.5644 20.6213 50.5702C31.4064 50.5801 40.6477 44.7495 46.2693 30.6533C48.1193 30.684 53.0017 30.9843 55.391 26.3674C55.4491 26.2894 55.9992 25.1429 55.9992 25.1429L55.0882 24.5306V24.5298ZM14.0448 21.2826H7.99513V27.3323H14.0448V21.2826ZM21.8607 21.2826H15.8111V27.3323H21.8607V21.2826ZM29.6767 21.2826H23.627V27.3323H29.6767V21.2826ZM37.4926 21.2826H31.4429V27.3323H37.4926V21.2826ZM6.23051 21.2826H0.179188V27.3323H6.22885V21.2826H6.23051ZM14.0464 13.6409H7.99679V19.6905H14.0464V13.6409ZM21.8624 13.6409H15.8127V19.6905H21.8624V13.6409ZM29.6783 13.6409H23.6287V19.6905H29.6783V13.6409ZM29.6758 6H23.6262V12.0497H29.6758V6Z"
        // fill="#8D98A0"
        fill={color}
      />
    </svg>
  );
}

export function LogoMarkevroc({
  width = 40,
  height = 40,
  color = "#0078FF",
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M56 27.9376C56 26.3868 55.3888 24.965 54.2728 23.6902C53.5494 24.3684 52.6823 25.0064 51.6767 25.6014C52.2724 26.3387 52.5976 27.1208 52.5976 27.9376C52.5976 32.7182 42.4283 36.3482 27.9998 36.3482C13.5713 36.3482 3.40199 32.7182 3.40199 27.9376C3.40199 27.1131 3.71143 26.3237 4.28631 25.5802C3.2964 24.991 2.44178 24.36 1.72721 23.6902C0.611178 24.965 0 26.3868 0 27.9376C0 34.9715 12.5359 39.355 27.9998 39.355C43.4637 39.355 56 34.9715 56 27.9376ZM50.1493 30.5968C48.5753 29.7866 46.7311 29.083 44.6644 28.4997C42.2655 29.1592 39.5939 29.6645 36.7316 30.001C40.7741 30.5081 44.2956 31.3609 46.9859 32.4678C48.3194 31.8907 49.3801 31.2586 50.1493 30.5968ZM19.1174 29.9823C16.3123 29.6458 13.6919 29.1475 11.3356 28.4997C9.2685 29.083 7.4247 29.7866 5.85037 30.5968C6.59794 31.2395 7.62085 31.8544 8.90113 32.4183C11.535 31.3228 15.0129 30.4795 19.1174 29.9823ZM56 18.1173H55.9985C55.9985 11.0813 43.4637 6.7 27.9998 6.7C12.5363 6.7 0.00146573 11.0813 0.00146573 18.1173H0C0 25.1512 12.5359 29.5347 27.9998 29.5347C43.4637 29.5347 56 25.1512 56 18.1173ZM52.5976 18.1173C52.5976 22.8979 42.4283 26.5279 27.9998 26.5279C13.5713 26.5279 3.40199 22.8979 3.40199 18.1173H3.40383C3.40383 13.3353 13.5728 9.70566 27.9998 9.70566C41.6987 9.70566 52.5962 13.3353 52.5962 18.1173H52.5976ZM46.987 22.5826C48.3201 22.0055 49.3808 21.373 50.15 20.7113C45.0285 18.0755 37.0146 16.5837 27.9998 16.5837C18.985 16.5837 10.9711 18.0755 5.85001 20.7113C6.5972 21.3544 7.62011 21.9692 8.90003 22.5327C13.2732 20.7142 19.976 19.5905 27.9998 19.5905C35.6892 19.5905 42.4947 20.734 46.987 22.5826ZM1.72721 33.6391C0.611178 34.9139 0 36.3354 0 37.8866C0 44.9205 12.5359 49.3036 27.9998 49.3036C43.4637 49.3036 56 44.9205 56 37.8866C56 36.3354 55.3888 34.9139 54.2728 33.6391C53.5494 34.3171 52.6823 34.9554 51.6767 35.5504C52.2724 36.2877 52.5976 37.0697 52.5976 37.8866C52.5976 42.6671 42.4283 46.2968 27.9998 46.2968C13.5713 46.2968 3.40199 42.6671 3.40199 37.8866C3.40199 37.0617 3.71143 36.2727 4.28631 35.5291C3.2964 34.94 2.44178 34.309 1.72721 33.6391Z"
        // fill="#8D98A0"
        fill={color}
      />
    </svg>
  );
}

export function LogoMarkMLH({ width = 40, height = 40, ...rest }: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        id="M"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.4951 20.3425C19.3289 19.9794 19.1023 19.6471 18.8249 19.3598C18.5422 19.0768 18.2089 18.8495 17.8422 18.6896C17.4576 18.5289 17.0468 18.4401 16.6301 18.4277H0.523787C0.453154 18.4215 0.382027 18.4305 0.315086 18.4538C0.248145 18.4772 0.186907 18.5144 0.1354 18.5631C0.0866816 18.6146 0.0494208 18.6759 0.0260692 18.7428C0.00271766 18.8098 -0.00619538 18.8809 -8.35109e-05 18.9515V37.072C-8.35109e-05 37.4153 0.164304 37.5797 0.507529 37.5797H4.19088C4.53411 37.5797 4.6985 37.4153 4.6985 37.072V22.9618H7.69359V37.072C7.69335 37.1386 7.70634 37.2045 7.73181 37.266C7.75728 37.3275 7.79472 37.3833 7.84195 37.4302C7.88918 37.4771 7.94527 37.5142 8.00694 37.5392C8.06862 37.5642 8.13465 37.5768 8.20121 37.576H11.572C11.6375 37.5792 11.7028 37.5678 11.7634 37.5428C11.824 37.5179 11.8783 37.4799 11.9225 37.4315C12.0085 37.331 12.0548 37.2025 12.0526 37.0702V22.9618H15.0422V37.072C15.0405 37.2045 15.0875 37.3331 15.1741 37.4333C15.216 37.4829 15.2687 37.5221 15.3283 37.5478C15.3879 37.5735 15.4526 37.585 15.5173 37.5815H19.2332C19.2999 37.5817 19.3661 37.5687 19.4277 37.5433C19.4894 37.5179 19.5455 37.4805 19.5927 37.4333C19.6399 37.3861 19.6772 37.3301 19.7027 37.2684C19.7281 37.2067 19.7411 37.1406 19.7408 37.0738V21.5546C19.7435 21.1379 19.6599 20.7252 19.4951 20.3425Z"
        fill="#E73427"
      />
      <path
        id="L"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M36.2898 33.078C36.2442 33.0283 36.1882 32.9892 36.1257 32.9636C36.0633 32.938 35.996 32.9265 35.9285 32.9299V32.9461H28.1807C28.1122 32.9509 28.0435 32.9418 27.9787 32.9195C27.9138 32.8971 27.8541 32.862 27.8031 32.8161C27.7498 32.7726 27.7074 32.7173 27.6792 32.6546C27.6509 32.5919 27.6377 32.5235 27.6405 32.4548V18.9696C27.6405 18.6264 27.4599 18.4457 27.0986 18.4457H23.2111C22.8498 18.4457 22.6692 18.6264 22.6692 18.9696V37.0721C22.6692 37.4153 22.8498 37.5959 23.2111 37.5959H35.9304C35.9976 37.5981 36.0646 37.5861 36.1269 37.5605C36.1891 37.535 36.2453 37.4966 36.2916 37.4478C36.3876 37.3463 36.4407 37.2117 36.4398 37.0721V33.4592C36.4419 33.3888 36.4297 33.3187 36.4039 33.2532C36.3781 33.1877 36.3393 33.1281 36.2898 33.078Z"
        fill="#1D539F"
      />
      <path
        id="H"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M55.85 18.592C55.8007 18.5431 55.742 18.5048 55.6774 18.4793C55.6128 18.4538 55.5436 18.4418 55.4742 18.4439H51.5127C51.4433 18.4419 51.3742 18.454 51.3096 18.4794C51.245 18.5049 51.1863 18.5432 51.1369 18.592C51.0839 18.6393 51.0417 18.6976 51.0133 18.7628C50.9849 18.8279 50.971 18.8985 50.9726 18.9696V25.1115C50.9754 25.1811 50.9637 25.2504 50.9384 25.3153C50.9131 25.3801 50.8746 25.439 50.8254 25.4882C50.7761 25.5374 50.7173 25.5759 50.6524 25.6012C50.5876 25.6266 50.5182 25.6382 50.4487 25.6354H44.8993C44.5831 25.6354 44.4151 25.4891 44.3754 25.2217V18.9696C44.3754 18.6264 44.1948 18.4457 43.8335 18.4457H39.8918C39.5305 18.4457 39.3499 18.6264 39.3499 18.9696V37.1208C39.3499 37.464 39.5305 37.6447 39.8918 37.6447H43.8353C44.1966 37.6447 44.3772 37.464 44.3772 37.1208V30.6682C44.4042 30.5757 44.4553 30.4922 44.5253 30.4261C44.6313 30.3396 44.7643 30.2929 44.9011 30.2942H50.4505C50.5192 30.2884 50.5883 30.2971 50.6534 30.3199C50.7184 30.3426 50.7779 30.3788 50.828 30.4261C50.8762 30.4728 50.9141 30.5291 50.9393 30.5913C50.9645 30.6535 50.9765 30.7203 50.9744 30.7874V37.1226C50.9753 37.1933 50.9903 37.2631 51.0185 37.328C51.0467 37.3928 51.0876 37.4513 51.1388 37.5002C51.1884 37.5484 51.2473 37.5862 51.3118 37.6114C51.3764 37.6365 51.4453 37.6484 51.5145 37.6465H55.476C55.5453 37.6485 55.6142 37.6366 55.6788 37.6115C55.7433 37.5864 55.8022 37.5485 55.8518 37.5002C55.9046 37.4526 55.9466 37.3944 55.9749 37.3292C56.0033 37.2641 56.0174 37.1936 56.0162 37.1226V18.9696C56.0155 18.8987 56.0004 18.8287 55.9718 18.7638C55.9432 18.6989 55.9018 18.6404 55.85 18.592Z"
        fill="#F8B92A"
      />
    </svg>
  );
}

export function LogoMarkWorldRemit({
  width = 40,
  height = 40,
  colorForeground = "#813FD6",
  colorBackground = "#813FD6B3",
  ...rest
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1804_9290)">
        <path
          opacity="0.7"
          d="M24.402 18.7368H24.234L21.546 26.6947L21.21 27.6632C21.126 27.9579 21.126 28.2947 21.21 28.5895L23.856 36.3368C23.982 36.7579 24.318 37.0526 24.696 37.221L25.2 37.3895L27.93 29.3895L28.308 28.2947C28.392 28 28.392 27.6632 28.308 27.3684L25.662 19.6632C25.452 19.1579 24.99 18.7789 24.402 18.7368ZM43.05 18.2316H37.338C37.002 18.2316 36.708 18.4421 36.624 18.7368L33.978 26.5263L33.768 27.1579C33.6 27.621 33.6 28.1263 33.768 28.5895L36.624 36.9684C36.708 37.2631 37.002 37.4737 37.338 37.4316L37.59 37.3895L43.764 19.2C43.89 18.7789 43.68 18.3579 43.26 18.2316C43.176 18.2316 43.134 18.2316 43.05 18.2316Z"
          // fill="#C3CBD0"
          fill={colorBackground}
        />
        <path
          d="M30.9121 2.10526C31.0381 2.10526 31.1221 2.14737 31.2061 2.18948L48.1741 11.8316C48.3001 11.9158 48.4261 12.0421 48.4681 12.2105L53.6761 31.0316C53.7181 31.2 53.7181 31.3684 53.6341 31.4947L44.0161 48.5053C43.9321 48.6316 43.8061 48.7579 43.6381 48.8L24.8641 54.021C24.8221 54.021 24.7381 54.0632 24.6961 54.0632C24.5701 54.0632 24.4861 54.0211 24.4021 53.979L7.43411 44.3368C7.30811 44.2526 7.18211 44.1263 7.14011 43.9579L1.93211 25.1368C1.89011 24.9684 1.89011 24.8 1.97411 24.6737L11.5921 7.66316C11.6761 7.53685 11.8021 7.41053 11.9701 7.36842L30.7441 2.10526C30.7861 2.10526 30.8701 2.10526 30.9121 2.10526ZM30.9121 0.210526C30.7021 0.210526 30.4501 0.252629 30.2401 0.294735L11.4661 5.51579C10.8361 5.68421 10.2901 6.10526 9.95411 6.69473L0.378114 23.7053C0.0421144 24.2947 -0.0418858 24.9684 0.126114 25.6421L5.33411 44.4632C5.50211 45.0947 5.92211 45.6421 6.51011 45.979L23.4781 55.6211C24.0661 55.9579 24.7381 56.0421 25.3681 55.8737L44.1421 50.6526C44.7721 50.4842 45.3181 50.0632 45.6541 49.4737L55.2721 32.4632C55.6081 31.8737 55.6921 31.2 55.5241 30.5684L50.3161 11.7474C50.1481 11.1158 49.7281 10.5684 49.1401 10.2316L32.1721 0.58947C31.7941 0.336839 31.3321 0.210526 30.9121 0.210526ZM24.4861 37.9368H18.7741C18.4381 37.9368 18.1441 37.7263 18.0601 37.4316L11.8861 19.2421C11.7601 18.8211 11.9701 18.4 12.3481 18.2737C12.4321 18.2316 12.5161 18.2316 12.6001 18.2316H18.3121C18.6481 18.2316 18.9421 18.4421 19.0261 18.7368L25.2001 36.9263C25.3261 37.3474 25.1161 37.7684 24.7381 37.8947C24.6541 37.9368 24.5701 37.9368 24.4861 37.9368ZM36.8341 37.9368H31.1641C30.8281 37.9368 30.5341 37.7263 30.4501 37.4316L24.2761 19.2421C24.1501 18.8211 24.3601 18.4 24.7381 18.2737C24.8221 18.2316 24.9061 18.2316 24.9901 18.2316H30.6601C30.9961 18.2316 31.2901 18.4421 31.3741 18.7368L37.5481 36.9263C37.6741 37.3474 37.4641 37.7684 37.0441 37.8947C37.0021 37.9368 36.9181 37.9368 36.8341 37.9368Z"
          // fill="#8D98A0"
          fill={colorForeground}
        />
      </g>
      <defs>
        <clipPath id="clip0_1804_9290">
          <rect width="56" height="56" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
