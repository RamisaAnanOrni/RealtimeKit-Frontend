"use client";

import { useState } from "react";
import { createMeeting } from "../lib/api";

export default function Home() {
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreateMeeting() {
    try {
      setLoading(true);

      const data = await createMeeting();

      console.log(data);

      setMeeting(data);
    } catch (error) {
      console.error(error);
      alert("Failed to create consultation.");
    } finally {
      setLoading(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  }

  if (meeting) {
    return (
      <div
        style={{
          padding: 40,
          fontFamily: "Arial",
        }}
      >
        <h1>Meeting Created Successfully 🎉</h1>

        <h2>
          Meeting ID
        </h2>

        <p>{meeting.meeting.id}</p>

        <hr />

        <h2>Farmer Join Link</h2>

        <textarea
          value={meeting.farmer.join_url}
          rows={4}
          cols={100}
          readOnly
        />

        <br />
        <br />

        <button
          onClick={() =>
            copy(meeting.farmer.join_url)
          }
        >
          Copy Farmer Link
        </button>

        <button
          style={{
            marginLeft: 20,
          }}
          onClick={() => {
            window.open(
              meeting.farmer.join_url,
              "_blank"
            );
          }}
        >
          Join as Farmer
        </button>

        <hr
          style={{
            marginTop: 40,
            marginBottom: 40,
          }}
        />

        <h2>Veterinarian Join Link</h2>

        <textarea
          value={meeting.vet.join_url}
          rows={4}
          cols={100}
          readOnly
        />

        <br />
        <br />

        <button
          onClick={() =>
            copy(meeting.vet.join_url)
          }
        >
          Copy Vet Link
        </button>

        <button
          style={{
            marginLeft: 20,
          }}
          onClick={() => {
            window.open(
              meeting.vet.join_url,
              "_blank"
            );
          }}
        >
          Join as Veterinarian
        </button>

        <hr
          style={{
            marginTop: 40,
          }}
        />

        <button
          onClick={() => {
            setMeeting(null);
          }}
        >
          Create Another Consultation
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 40,
        fontFamily: "Arial",
      }}
    >
      <h1>VetConnect Video Consultation</h1>

      <p>
        Click below to create a new consultation between a Farmer and a Veterinarian.
      </p>

      <button
        onClick={handleCreateMeeting}
        disabled={loading}
        style={{
          padding: "12px 24px",
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        {loading
          ? "Creating..."
          : "Create Consultation"}
      </button>
    </div>
  );
}