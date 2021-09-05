import React, { useState } from "react";
import { Link } from "@reach/router";
import "./index.scss";
import styles from "./index.module.scss";
import { hasAccess } from "@test/data";

export default function Root(props) {
  const [links, setLinks] = useState([
    {
      name: "main",
      href: "/main",
    },
  ]);

  return (
    <div className="navbar h60 bg-dark">
      <div className="full flex items-center justify-between">
        <div className="flex items-center justify-between">
          {links.map((link) => {
            return (
              <Link key={link.href} className="p-6 text-white" to={link.href}>
                {link.name}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <a
            href="https://github.com/sileny/react-microfrontends"
            className={styles.externalLink}
          >
            Github project
          </a>
          <span className={styles.hasAccess}>
            admin has access：{JSON.stringify(hasAccess("admin"))}
          </span>
        </div>
      </div>
    </div>
  );
}
