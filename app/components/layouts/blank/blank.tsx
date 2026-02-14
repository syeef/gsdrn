import React, { useState, useEffect } from "react";
import { Form, Link, Outlet } from "react-router";

import styles from "./blank.module.css";

export default function LayoutBlank() {
  return <Outlet />;
}
