import { useEffect, useRef } from "react";
import type DyteClient from "@dytesdk/web-core";

/**
 * Fires a backend notification (via `onLeave`) exactly once whenever the
 * participant leaves the room — pressing the built-in Dyte "Leave" control,
 * being kicked, or the host ending the call for everyone.
 *
 * Dyte exposes the room-lifecycle on the participant's self object:
 * `meeting.self` emits a `roomLeft` event with `{ state: LeaveRoomState }`.
 */
export function useMeetingLeaveSync(
  meeting: DyteClient | undefined,
  onLeave: () => Promise<void> | void,
) {
  const callbackRef = useRef(onLeave);
  const handledRef = useRef(false);

  // Keep the latest `onLeave` without re-arming the Dyte listener on every
  // render (the listener is registered once per meeting instance below).
  useEffect(() => {
    callbackRef.current = onLeave;
  });

  useEffect(() => {
    if (!meeting) return;

    const handleRoomLeft = async () => {
      // The SDK can fire this more than once (e.g. podcast/self teardown);
      // only the first leave transition triggers the backend call + redirect.
      if (handledRef.current) return;
      handledRef.current = true;
      await callbackRef.current();
    };

    meeting.self.on("roomLeft", handleRoomLeft);
    return () => {
      meeting.self.off("roomLeft", handleRoomLeft);
    };
  }, [meeting]);
}