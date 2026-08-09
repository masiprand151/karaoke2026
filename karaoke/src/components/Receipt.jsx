import React, { forwardRef } from "react";
import dayjs from "dayjs";
import { normalizeOrders } from "../utils/normalize";
import { formatRp } from "../utils/rupiah";
import useSetting from "../hooks/useSetting";
import { formatDuration } from "../utils/Time";

const style = {
  receipt: {
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: "1.4",
  },

  center: {
    textAlign: "center",
    margin: 0,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  td: {
    padding: "2px 0",
  },

  right: {
    padding: "2px 0",
    textAlign: "right",
  },

  hr: {
    border: "none",
    borderTop: "1px dashed #000",
    margin: "4px 0",
  },
};

export const Receipt = forwardRef(({ session }, ref) => {
  if (!session) return null;

  const { setting } = useSetting();

  const normalizedFnbs = normalizeOrders(session.sessionFnbs, "fnb");
  const normalizedLadies = normalizeOrders(session.sessionLadies, "lady");

  const pricing = session?.pricing;
  const durationMinutes = session?.durationMinutes || 0;
  const extendMinutes = session?.extendMinutes || 0;
  const freeMinutes = session?.freeMinutes || 0;

  const totalMinutes = durationMinutes + extendMinutes + freeMinutes;

  const roomSubTotal = Number(session.amount) - Number(session.roomDisAmount);

  return (
    <div
      ref={ref}
      style={{
        width: `${setting?.printSize}mm`,
        ...style.receipt,
      }}
    >
      <p style={style.center}>{setting?.printTitle}</p>

      <p style={style.center}>{session.transaction.number}</p>

      <p style={style.center}>{dayjs().format("YYYY-MM-DD HH:mm:ss")}</p>

      <hr style={style.hr} />

      <table style={style.table}>
        <tbody>
          <tr>
            <td style={style.td}>Room</td>

            <td style={style.right}>
              {session.room.name} - {pricing?.name.toUpperCase()}
            </td>
          </tr>

          <tr>
            <td style={style.td}>Customer</td>

            <td style={style.right}>{session.customerName}</td>
          </tr>

          <tr>
            <td style={style.td}>Duration</td>

            <td style={style.right}>
              {formatDuration(session.durationMinutes)}
            </td>
          </tr>

          <tr>
            <td style={style.td}>Extend</td>

            <td style={style.right}>{formatDuration(session.extendMinutes)}</td>
          </tr>

          <tr>
            <td style={style.td}>Free</td>

            <td style={style.right}>{formatDuration(session.freeMinutes)}</td>
          </tr>

          <tr>
            <td style={style.td}>Total</td>

            <td style={style.right}>{formatDuration(totalMinutes)}</td>
          </tr>

          <tr>
            <td style={style.td}>Room Charge</td>

            <td style={style.right}>{formatRp(session.amount)}</td>
          </tr>

          <tr>
            <td style={style.td}>Discount</td>

            <td style={style.right}>{formatRp(session?.roomDisAmount)}</td>
          </tr>
        </tbody>
      </table>

      <hr style={style.hr} />

      {/* F&B subtotal */}
      {normalizedFnbs?.length > 0 && (
        <>
          <p>
            <strong>F&B Orders</strong>
          </p>

          <table style={style.table}>
            <tbody>
              {normalizedFnbs.map((fnb, i) => (
                <tr key={i}>
                  <td style={style.td}>{fnb.name}</td>

                  <td style={style.td}>x{fnb.quantity}</td>

                  <td style={style.right}>{formatRp(fnb.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <hr style={style.hr} />

      {/* Lady subtotal */}
      {normalizedLadies?.length > 0 && (
        <>
          <p>
            <strong>Lady Companion</strong>
          </p>

          <table style={style.table}>
            <tbody>
              {normalizedLadies.map((lady, i) => (
                <tr key={i}>
                  <td style={style.td}>{lady.name}</td>

                  <td style={style.td}>x{lady.quantity}</td>

                  <td style={style.right}>{formatRp(lady.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <hr style={style.hr} />

      <table style={style.table}>
        <tbody>
          <tr>
            <td style={style.td}>Subtotal Room</td>

            <td style={style.right}>{formatRp(roomSubTotal)}</td>
          </tr>

          <tr>
            <td style={style.td}>Subtotal F&B</td>

            <td style={style.right}>{formatRp(session.fnbSubtotal)}</td>
          </tr>

          <tr>
            <td style={style.td}>Subtotal LC</td>

            <td style={style.right}>{formatRp(session.ladyTotal)}</td>
          </tr>

          <tr>
            <td style={style.td}>Tax</td>

            <td style={style.right}>{formatRp(session.taxAmount)}</td>
          </tr>

          <tr>
            <td style={style.td}>Service</td>

            <td style={style.right}>{formatRp(session.serviceAmount)}</td>
          </tr>

          <tr>
            <td style={style.td}>
              <strong>Grand Total</strong>
            </td>

            <td style={style.right}>
              <strong>{formatRp(session.grandTotal)}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <hr style={style.hr} />

      <p style={style.center}>
        Metode Bayar: {session.transaction.paymentMethod}
      </p>

      <p style={style.center}>Status: {session.status}</p>

      <hr style={style.hr} />

      <p style={style.center}>Terima kasih</p>
    </div>
  );
});

export const ReceiptFnb = forwardRef(({ cart, session }, ref) => {
  const { setting } = useSetting();

  return (
    <div
      ref={ref}
      style={{
        width: `${setting?.printSze}mm`,
        ...style.receipt,
      }}
    >
      <p style={style.center}>
        <strong>F&B Order</strong>
      </p>

      <p style={style.center}>{dayjs().format("YYYY-MM-DD HH:mm:ss")}</p>

      <hr style={style.hr} />

      <table style={style.table}>
        <tbody>
          <tr>
            <td style={style.td}>Room</td>

            <td style={style.right}>{session.room.name}</td>
          </tr>

          <tr>
            <td style={style.td}>Customer</td>

            <td style={style.right}>{session.customerName}</td>
          </tr>
        </tbody>
      </table>

      <hr style={style.hr} />

      <table style={style.table}>
        <tbody>
          {cart.map((item, i) => (
            <tr key={i}>
              <td style={style.td}>{item.name}</td>

              <td style={style.td}>x{item.quantity}</td>

              <td style={style.right}>
                {formatRp(item.basePrice * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={style.hr} />

      <p style={style.center}>Terima kasih</p>
    </div>
  );
});

export const ReceiptLady = forwardRef(
  ({ orders, roomName, customerName }, ref) => {
    const { setting } = useSetting();

    return (
      <div
        ref={ref}
        style={{
          width: `${setting?.printSze}mm`,
          ...style.receipt,
        }}
      >
        <h3 style={style.center}>Order Lady</h3>

        <p style={style.center}>{dayjs().format("YYYY-MM-DD HH:mm:ss")}</p>

        <hr style={style.hr} />

        <p>Room: {roomName}</p>

        <p>Customer: {customerName}</p>

        <hr style={style.hr} />

        <table style={style.table}>
          <tbody>
            {orders.map((lady, i) => (
              <tr key={i}>
                <td style={style.td}>{lady.name}</td>

                <td style={style.td}>x{lady.quantity}</td>

                <td style={style.right}>
                  {formatRp(lady.basePrice * lady.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <hr style={style.hr} />

        <p style={style.center}>Terima kasih</p>
      </div>
    );
  },
);
