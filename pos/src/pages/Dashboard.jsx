import { useState } from "react";
import RoomGrid from "../components/room/RoomGrid";
import useRoom from "../hooks/useRoom";
import ModalCheckin from "../components/ModalCheckin";
import ModalSessionDetail from "../components/session/ModalSessionDetail";

export default function Dashboard() {
  const room = useRoom();
  const [selected, setSelected] = useState(null);
  const [showModalCheckin, setShowModalCheckin] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const handleDetail = (room) => {
    setShowDetail(true);
    setSelected(room);
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

      <ModalSessionDetail
        show={showDetail}
        room={selected}
        onClose={() => {
          setSelected(null);
          setShowDetail(false);
        }}
      />
    </>
  );
}
