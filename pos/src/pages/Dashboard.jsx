import RoomGrid from "../components/room/RoomGrid";
import useRoom from "../hooks/useRoom";

export default function Dashboard() {
  const room = useRoom();

  const handleDetail = (room) => {
    console.log("Detail room:", room);
  };

  return (
    <>
      <RoomGrid rooms={room.data || []} onDetail={handleDetail} />
    </>
  );
}
