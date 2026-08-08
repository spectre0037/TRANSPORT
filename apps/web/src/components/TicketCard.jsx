import { Download, Bus, Calendar, Clock, MapPin, User, Ticket, X } from 'lucide-react';

export default function TicketCard({ booking, passengerName, onClose }) {
  const handlePrint = () => {
    const dep = booking.departure || {};
    const seat = booking.seat || {};
    const ticketHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ticket - ${booking.bookingReference}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            background: #fef7f4;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
          @media print {
            body { padding: 0; background: white; }
            @page { margin: 0.5in; }
          }
          .ticket {
            width: 420px;
            background: white;
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
            overflow: hidden;
            border: 1px solid #E8DDD5;
          }
          .ticket-header {
            background: linear-gradient(135deg, #7C1648, #580F33);
            color: white;
            padding: 28px 24px;
            text-align: center;
            position: relative;
          }
          .ticket-header h1 { font-size: 22px; letter-spacing: 1px; margin-bottom: 4px; }
          .ticket-header p { font-size: 12px; opacity: 0.8; text-transform: uppercase; letter-spacing: 2px; }
          .ticket-divider {
            display: flex;
            align-items: center;
            padding: 0 24px;
          }
          .ticket-divider .dots {
            flex: 1;
            border-bottom: 2px dashed #E8DDD5;
            position: relative;
          }
          .ticket-divider .circle-left,
          .ticket-divider .circle-right {
            width: 16px;
            height: 16px;
            background: #fef7f4;
            border-radius: 50%;
            flex-shrink: 0;
          }
          .ticket-body { padding: 20px 24px 24px; }
          .route-big {
            font-size: 20px;
            font-weight: 700;
            color: #2D1B27;
            text-align: center;
            margin-bottom: 20px;
          }
          .route-big span { color: #7C1648; }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
          }
          .info-item { }
          .info-item .label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #8A7A82;
            margin-bottom: 4px;
          }
          .info-item .value {
            font-size: 14px;
            font-weight: 600;
            color: #2D1B27;
          }
          .ticket-id {
            text-align: center;
            padding: 16px;
            background: #fef7f4;
            border-radius: 12px;
            margin-top: 16px;
          }
          .ticket-id .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #8A7A82; }
          .ticket-id .value {
            font-size: 18px;
            font-weight: 800;
            color: #7C1648;
            letter-spacing: 1px;
            font-family: 'Courier New', monospace;
            margin-top: 4px;
          }
          .ticket-footer {
            padding: 16px 24px;
            border-top: 1px solid #E8DDD5;
            text-align: center;
            font-size: 10px;
            color: #8A7A82;
          }
          .gender-badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .gender-male { background: #dbeafe; color: #1d4ed8; }
          .gender-female { background: #fce7f3; color: #db2777; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="ticket-header">
            <h1>🎓 TaleemXpress</h1>
            <p>E-Ticket • ${booking.bookingReference}</p>
          </div>
          <div class="ticket-divider">
            <div class="circle-left"></div>
            <div class="dots"></div>
            <div class="circle-right"></div>
          </div>
          <div class="ticket-body">
            <div class="route-big">
              ${dep.fromCity || ''} → ${dep.toCity || ''}
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="label">Passenger</div>
                <div class="value">${passengerName || '—'}</div>
              </div>
              <div class="info-item" style="text-align:right">
                <div class="label">Seat</div>
                <div class="value">#${seat.seatNumber || '—'} (Row ${seat.row || '—'})</div>
              </div>
              <div class="info-item">
                <div class="label">Date</div>
                <div class="value">${dep.departureDate ? new Date(dep.departureDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</div>
              </div>
              <div class="info-item" style="text-align:right">
                <div class="label">Time</div>
                <div class="value">${dep.departureTime || '—'}</div>
              </div>
              <div class="info-item">
                <div class="label">Route</div>
                <div class="value">${dep.route || '—'}</div>
              </div>
              <div class="info-item" style="text-align:right">
                <div class="label">Gender</div>
                <div class="value"><span class="gender-badge ${booking.gender === 'male' ? 'gender-male' : 'gender-female'}">${booking.gender === 'male' ? '👨 Male' : '👩 Female'}</span></div>
              </div>
            </div>
            <div class="ticket-id">
              <div class="label">Ticket ID</div>
              <div class="value">${booking.bookingReference}</div>
            </div>
          </div>
          <div class="ticket-footer">
            This is your official TaleemXpress e-ticket. Present it digitally or as a printout when boarding.
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); };
        <\\/script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.write(ticketHtml);
      printWin.document.close();
    }
  };

  return (
    <div className="clay-card relative mx-auto max-w-[92vw] overflow-hidden sm:max-w-sm">
      {/* Branded top */}
      <div className="bg-gradient-to-r from-clay-primary to-clay-secondary text-white text-center py-6 px-4 -mx-6 -mt-6 mb-4">
        <h2 className="text-xl font-bold tracking-wider">🎓 TaleemXpress</h2>
        <p className="text-xs text-white/70 uppercase tracking-widest mt-0.5">E-Ticket</p>
      </div>

      {/* Dashed divider */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-clay-bg flex-shrink-0"></div>
        <div className="flex-1 border-b-2 border-dashed border-clay-border"></div>
        <div className="w-3 h-3 rounded-full bg-clay-bg flex-shrink-0"></div>
      </div>

      {/* Route */}
      <div className="text-center mb-5">
        <p className="text-lg font-bold text-clay-text">
          {booking.departure?.fromCity || ''} <span className="text-clay-primary">→</span> {booking.departure?.toCity || ''}
        </p>
        <p className="text-sm text-clay-muted">{booking.departure?.route}</p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-clay-muted font-semibold">Passenger</p>
          <p className="font-bold text-clay-text">{passengerName || '—'}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-clay-muted font-semibold">Seat</p>
          <p className="font-bold text-clay-text">#{booking.seat?.seatNumber || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-clay-muted font-semibold">Date</p>
          <p className="font-bold text-clay-text text-sm">
            {booking.departure?.departureDate ? new Date(booking.departure.departureDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-clay-muted font-semibold">Time</p>
          <p className="font-bold text-clay-text">{booking.departure?.departureTime || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-clay-muted font-semibold">Gender</p>
          <span className={`clay-badge text-xs ${booking.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
            {booking.gender === 'male' ? '👨 Male' : '👩 Female'}
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-clay-muted font-semibold">Amount</p>
          <p className="font-bold text-clay-primary">PKR {booking.totalAmount}</p>
        </div>
      </div>

      {/* Ticket ID */}
      <div className="bg-clay-bg rounded-clay p-4 text-center mb-4">
        <p className="text-[10px] uppercase tracking-wider text-clay-muted font-semibold">Ticket ID</p>
        <p className="text-lg font-extrabold text-clay-primary tracking-wide font-mono">{booking.bookingReference}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onClose} className="clay-btn-outline flex-1 flex items-center justify-center gap-2">
          <X size={16} /> Close
        </button>
        <button onClick={handlePrint} className="clay-btn-primary flex-1 flex items-center justify-center gap-2">
          <Download size={16} /> Print Ticket
        </button>
      </div>

      <p className="text-[10px] text-clay-muted text-center mt-3">
        Present this ticket digitally or as a printout when boarding.
      </p>
    </div>
  );
}
