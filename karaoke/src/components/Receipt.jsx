import React, { forwardRef } from "react";
import dayjs from "dayjs";
import { normalizeOrders } from "../utils/normalize";
import { formatRp } from "../utils/rupiah";
import useSetting from "../hooks/useSetting";
import { formatDuration } from "../utils/Time";

export const Receipt = forwardRef(({ session }, ref) => {
  if (!session) return null;
  const { setting } = useSetting();
  const normalizedFnbs = normalizeOrders(session.sessionFnbs, "fnb");
  const normalizedLadies = normalizeOrders(session.sessionLadies, "lady");
  const pricing = session?.pricing;
  console.log(session);
  const durationMinutes = session?.durationMinutes || 0;
  const extendMinutes = session?.extendMinutes || 0;
  const freeMinutes = session?.freeMinutes || 0;

  const totalMinutes = durationMinutes + extendMinutes + freeMinutes;

  return (
    <div
      ref={ref}
      className="receipt"
      style={{
        width: `${setting?.printSze}mm`,
      }}
    >
      <h3 className="center">{setting?.printTitle}</h3>
      <p className="center">{session.transaction.number}</p>
      <p className="center">{dayjs().format("YYYY-MM-DD HH:mm:ss")}</p>
      <hr />
      <table>
        <tbody>
          <tr>
            <td>Room</td>
            <td className="right">
              {session.room.name} - {pricing?.name.toUpperCase()}
            </td>
          </tr>
          <tr>
            <td>Customer</td>
            <td className="right">{session.customerName}</td>
          </tr>
          <tr>
            <td>Duration</td>
            <td className="right">{formatDuration(session.durationMinutes)}</td>
          </tr>
          <tr>
            <td>Extend</td>
            <td className="right">{formatDuration(session.extendMinutes)}</td>
          </tr>
          <tr>
            <td>Free</td>
            <td className="right">{formatDuration(session.freeMinutes)}</td>
          </tr>
          <tr>
            <td>Total</td>
            <td className="right">{formatDuration(totalMinutes)}</td>
          </tr>
        </tbody>
      </table>
      {/* <p>
        Room: {session.room.name} - {pricing?.name.toUpperCase()}
      </p>
      <p>Customer: {session.customerName}</p>
      <p>Duration: {formatDuration(session.durationMinutes)}</p>
      <p>extend: {formatDuration(session.extendMinutes)}</p>
      <p>Free: {formatDuration(session.freeMinutes)}</p>
      <p>Total: {formatDuration(totalMinutes)} </p> */}

      <hr />

      {/* Room subtotal */}
      <table>
        <tbody>
          <tr>
            <td>Room Charge</td>
            <td className="right">{formatRp(session.amount)}</td>
          </tr>
          <tr>
            <td>Discount</td>
            <td className="right">{formatRp(session?.roomDisAmount)}</td>
          </tr>
        </tbody>
      </table>

      {/* F&B subtotal */}
      {normalizedFnbs?.length > 0 && (
        <>
          <p>
            <strong>F&B Orders</strong>
          </p>
          <table>
            <tbody>
              {normalizedFnbs.map((fnb, i) => (
                <tr key={i}>
                  <td>{fnb.name}</td>
                  <td>x{fnb.quantity}</td>
                  <td className="right">{formatRp(fnb.totalAmount)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2}>
                  <strong>Subtotal</strong>
                </td>
                <td className="right">{formatRp(session.fnbSubtotal)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
      <hr />
      {/* Lady subtotal */}
      {normalizedLadies?.length > 0 && (
        <>
          <p>
            <strong>Lady Companion</strong>
          </p>
          <table>
            <tbody>
              {normalizedLadies.map((lady, i) => (
                <tr key={i}>
                  <td>{lady.name}</td>
                  <td>x{lady.quantity}</td>
                  <td className="right">{formatRp(lady.totalAmount)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={2}>
                  <strong>Subtotal</strong>
                </td>
                <td className="right">{formatRp(session.ladyTotal)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <hr />
      <table>
        <tbody>
          <tr>
            <td>Tax</td>
            <td className="right">{formatRp(session.taxAmount)}</td>
          </tr>
          <tr>
            <td>Service</td>
            <td className="right">{formatRp(session.serviceAmount)}</td>
          </tr>
          <tr>
            <td>
              <strong>Grand Total</strong>
            </td>
            <td className="right">
              <strong>{formatRp(session.grandTotal)}</strong>
            </td>
          </tr>
        </tbody>
      </table>
      <hr />
      <p className="center">
        Metode Bayar: {session.transaction.paymentMethod}
      </p>
      <p className="center">Status: {session.status}</p>
      <hr />
      <p className="center">Terima kasih 🎶</p>
    </div>
  );
});
