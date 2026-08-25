import { useEffect, useState } from "react";
import BaseModal from "../BaseModal";
import api from "../../services/api";
import LoadingSpiner from "../LoadingSpiner";
import CardDeatail from "./CardDeatail";
import CardSummary from "./CardSummary";
import CardPayment from "./CardPayment";
import SessionAction from "./SessionAction";

export default function ModalSessionDetail({ show, room, onClose, onSuccess }) {
  const [previews, setPreviews] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPreview = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/session/preview/${room?.sessions[0]?.id}`);
      console.log(res);

      setPreviews(res);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!show) return;
    getPreview();
  }, [show]);

  return (
    <BaseModal
      title={`${room?.name} - ${previews?.transaction?.number}`}
      show={show}
      size="fullscreen"
      onClose={onClose}
    >
      {loading && <LoadingSpiner />}

      <div className="row">
        <div className="col">
          <CardDeatail previews={previews} />
          <div className="mt-3">
            <SessionAction />
          </div>
        </div>
        <div className="col">
          <CardSummary previews={previews} />
        </div>
        <div className="col">
          <CardPayment previews={previews} />
        </div>
      </div>
    </BaseModal>
  );
}
