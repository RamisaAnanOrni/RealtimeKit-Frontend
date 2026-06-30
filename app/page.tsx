"use client";

import { useState } from "react";

export default function Home() {
  const [meeting, setMeeting] = useState<any>(null);

  async function createMeeting() {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/create-meeting/",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      console.log(data);

      // Save everything in browser
      localStorage.setItem(
        "farmerToken",
        data.farmer.data.token
      );

      localStorage.setItem(
        "vetToken",
        data.vet.data.token
      );

      localStorage.setItem(
        "meetingId",
        data.meeting.data.id
      );

      setMeeting(data);
    } catch (error) {
      console.error(error);
      alert("Failed to create meeting.");
    }
  }

  if (meeting) {
    return (
      <div style={{ padding: 30 }}>
        <h1>Meeting Created Successfully 🎉</h1>

        <p>
          Meeting ID:
          <br />
          <b>{meeting.meeting.data.id}</b>
        </p>

        <br />

        <button
          onClick={() => {
            window.location.href = "/farmer";
          }}
          style={{
            padding: "12px 20px",
            marginRight: "20px",
            cursor: "pointer",
          }}
        >
          Join as Farmer
        </button>

        <button
          onClick={() => {
            window.location.href = "/vet";
          }}
          style={{
            padding: "12px 20px",
            cursor: "pointer",
          }}
        >
          Join as Vet
        </button>

        <br />
        <br />

        <h3>Farmer Token</h3>

        <textarea
          value={meeting.farmer.data.token}
          rows={8}
          cols={100}
          readOnly
        />

        <br />
        <br />

        <h3>Vet Token</h3>

        <textarea
          value={meeting.vet.data.token}
          rows={8}
          cols={100}
          readOnly
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>VetConnect Video Consultation</h1>

      <button
        onClick={createMeeting}
        style={{
          padding: "12px 20px",
          cursor: "pointer",
        }}
      >
        Create Consultation
      </button>
    </div>
  );
}