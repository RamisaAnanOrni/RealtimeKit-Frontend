"use client";

import { useEffect } from "react";

import { DyteMeeting } from "@dytesdk/react-ui-kit";
import { useDyteClient } from "@dytesdk/react-web-core";

export default function FarmerPage() {

  const [meeting, initMeeting] = useDyteClient();

  useEffect(() => {

    const token = localStorage.getItem("farmerToken");

    if (!token) {
      alert("Farmer token not found");
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