"use client";

import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useDyteClient } from "@dytesdk/react-web-core";

const DyteMeeting = dynamic(
  () =>
    import("@dytesdk/react-ui-kit").then((mod) => mod.DyteMeeting),
  {
    ssr: false,
  }
);

function FarmerMeeting() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [meeting, initMeeting] = useDyteClient();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function joinMeeting() {
      if (!token) {
        alert("Invalid farmer link.");
        setLoading(false);
        return;
      }

      try {
        await initMeeting({
          authToken: token,

          defaults: {
            audio: true,
            video: true,
          },
        });

        setLoading(false);
      } catch (error) {
        console.error(error);
        alert("Unable to join meeting.");
        setLoading(false);
      }
    }

    joinMeeting();
  }, [token, initMeeting]);

  if (loading || !meeting) {
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
        Joining Farmer...
      </div>
    );
  }

  return (
    <div style={{ height: "100vh" }}>
      <DyteMeeting meeting={meeting} />
    </div>
  );
}

export default function FarmerPage() {
  return (
    <Suspense
      fallback={
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
          Loading...
        </div>
      }
    >
      <FarmerMeeting />
    </Suspense>
  );
}
