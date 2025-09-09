/* path: src/pages/studentLessons/md/MDRenderers.tsx */
import React from "react";

export const MDRenderers = {
  code: ({ inline, className = "", children, ...p }: any) => {
    const lang = (className || "").toLowerCase();
    if (!inline && lang.includes("language-quiz")) return null;
    return (
      <code className={className} {...p}>
        {children}
      </code>
    );
  },
  pre: (props: any) => {
    const c: any = Array.isArray(props.children) ? props.children[0] : props.children;
    const cn = c?.props?.className?.toLowerCase?.() || "";
    if (cn.includes("language-quiz")) return null;
    return <pre {...props} />;
  },
};
