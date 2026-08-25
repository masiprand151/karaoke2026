import { useState } from "react";
import RoomGrid from "../components/room/RoomGrid";
import useRoom from "../hooks/useRoom";
import ModalCheckin from "../components/ModalCheckin";

export default function Dashboard() {
  const room = useRoom();
  const [selected, setSelected] = useState(null);
  const [showModalCheckin, setShowModalCheckin] = useState(false);

  const handleDetail = (room) => {
    console.log("Detail room:", room);
  };

  return (
    <>
      <RoomGrid
        rooms={room.data || []}
        onDetail={handleDetail}
        onCheckin={(r) => {
          setSelected(r);
          setShowModalCheckin(true);
        }}
      />

      <ModalCheckin
        show={showModalCheckin}
        onClose={() => {
          setSelected(null);
          setShowModalCheckin(false);
        }}
        room={selected}
        onSuccess={async () => {
          room.refresh();
          setShowModalCheckin(false);
          setSelected(null);
        }}
      />
    </>
  );
}
