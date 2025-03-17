"use client";

import * as React from "react";

import { Progress } from "@/components/ui/progress";

export function CustomProgress() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return <Progress value={progress} className="w-[60%]" />;
}
