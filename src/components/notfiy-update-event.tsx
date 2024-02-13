"use client";

import { useEffect, useState } from "react";
import { isEqual } from "lodash";

export const NotfiyUpdateEventWithSound = ({
  d1,
  d2,
}: {
  d1: any;
  d2: number;
}) => {
  const [d1State, setD1State] = useState<any>(d1);
  const [d2State, setD2State] = useState<any>(d2);

  const playNotificationSound = () => {
    let audio = new Audio("/a.mp3");
    audio.play();
  };

  useEffect(() => {
    if (!isEqual(d1, d1State)) {
      playNotificationSound();
      setD1State(d1);
    }
    if (d2 > d2State) {
      playNotificationSound();
      setD2State(d2);
    } else {
      setD2State(d2);
    }
  }, [d1, d2]);

  return <div className="hidden"></div>;
};
