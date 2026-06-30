"use client";

import { useEffect } from "react";

import { DyteMeeting } from "@dytesdk/react-ui-kit";
import { useDyteClient } from "@dytesdk/react-web-core";

export default function VetPage() {

  const [meeting, initMeeting] = useDyteClient();

  useEffect(() => {

    const token = localStorage.getItem("vetToken");

    if (!token) {
      alert("Vet token not found");
      return;
    }

    initMeeting({
      authToken: token,

      defaults: {
        audio: true,
        video: true,
      },
    });

  }, []);

  return (
    <div style={{ height: "100vh" }}>
      <DyteMeeting meeting={meeting} />
    </div>
  );
}