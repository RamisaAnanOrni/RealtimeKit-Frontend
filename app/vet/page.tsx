"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useDyteClient } from "@dytesdk/react-web-core";

const DyteMeeting = dynamic(
  () =>
    import("@dytesdk/react-ui-kit").then((mod) => mod.DyteMeeting),
  {
    ssr: false,
  }
);

export default function VetPage() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [meeting, initMeeting] = useDyteClient();

  useEffect(() => {
    if (!token) {
      alert("Invalid Vet Join Link");
      return;
    }

    initMeeting({
      authToken: token,
      defaults: {
        audio: true,
        video: true,
      },
    });
  }, [token, initMeeting]);

  if (!meeting) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 24,
          fontWeight: "bold",
        }}
      >
        Joining Vet Consultation...
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      <DyteMeeting meeting={meeting} />
    </div>
  );
}