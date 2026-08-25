import RoomCard from "./RoomCard";

export default function RoomGrid({ rooms, onDetail }) {
  return (
    <div className="room-grid">
      {rooms.map((room) => (
        <div key={room.id}>
          <RoomCard room={room} onDetail={onDetail} />
        </div>
      ))}
    </div>
  );
}
