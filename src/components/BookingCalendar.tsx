import React, { useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import type { SlotInfo, View } from 'react-big-calendar';
import moment from 'moment';
import { Paper } from '@mui/material';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup moment localizer
const localizer = momentLocalizer(moment);
moment.locale('vi');

// Interfaces
interface Transaction {
  transaction_id: number;
  amount: number;
  transaction_date: string;
  payment_method: 'cash' | 'transfer';
  booking_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface Booking {
  booking_id: number;
  booking_code: string;
  customer_id: number;
  court_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total_amount: number;
  customer_name?: string;
  court_name?: string;
  payment_status?: 'unpaid' | 'paid';
  transaction?: Transaction;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Booking;
}

interface BookingCalendarProps {
  bookings: Booking[];
  courts: Array<{ court_id: number; court_name: string }>;
  selectedCourt: number | 'all';
  showConflicts: boolean;
  currentView: View;
  currentDate: Date;
  onSelectSlot: (slotInfo: SlotInfo) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  onViewChange: (view: View) => void;
  onNavigate: (date: Date) => void;
  checkConflicts: (
    courtId: number,
    date: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: number
  ) => boolean;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookings,
  selectedCourt,
  showConflicts,
  currentView,
  currentDate,
  onSelectSlot,
  onSelectEvent,
  onViewChange,
  onNavigate,
  checkConflicts,
}) => {
  // Filter bookings based on selected court
  const filteredBookings =
    selectedCourt === 'all'
      ? bookings
      : bookings.filter((booking) => booking.court_id === selectedCourt);

  // Convert bookings to calendar events
  const events: CalendarEvent[] = filteredBookings.map((booking) => {
    const startDateTime = moment(
      `${booking.booking_date} ${booking.start_time}`,
      'YYYY-MM-DD HH:mm'
    ).toDate();
    const endDateTime = moment(
      `${booking.booking_date} ${booking.end_time}`,
      'YYYY-MM-DD HH:mm'
    ).toDate();

    return {
      id: booking.booking_id,
      title: `${booking.customer_name} - ${booking.court_name}`,
      start: startDateTime,
      end: endDateTime,
      resource: booking,
    };
  });

  // Event style getter for conflicts, status and payment
  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => {
      const booking = event.resource;
      let backgroundColor = '#3174ad';
      let border = '0px';

      // Color by status
      switch (booking.status) {
        case 'confirmed':
          backgroundColor = '#4caf50';
          break;
        case 'pending':
          backgroundColor = '#ff9800';
          break;
        case 'cancelled':
          backgroundColor = '#f44336';
          break;
      }

      // Add payment status indicator
      if (booking.payment_status === 'unpaid' && booking.status === 'confirmed') {
        border = '3px dashed #f44336'; // Red dashed border for unpaid
        backgroundColor = '#ff5722'; // Orange-red for unpaid confirmed bookings
      } else if (booking.payment_status === 'paid') {
        border = '2px solid #4caf50'; // Green solid border for paid
      }

      // Check for conflicts if enabled
      if (showConflicts) {
        const hasConflict = checkConflicts(
          booking.court_id,
          booking.booking_date,
          booking.start_time,
          booking.end_time,
          booking.booking_id
        );

        if (hasConflict) {
          backgroundColor = '#d32f2f';
          border = '3px solid #b71c1c';
        }
      }

      return {
        style: {
          backgroundColor,
          borderRadius: '4px',
          opacity: 0.8,
          color: 'white',
          border,
          display: 'block',
        },
      };
    },
    [checkConflicts, showConflicts]
  );

  return (
    <Paper sx={{ p: 2, height: 600 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        selectable
        popup
        view={currentView}
        onView={onViewChange}
        date={currentDate}
        onNavigate={onNavigate}
        eventPropGetter={eventStyleGetter}
        step={30}
        timeslots={2}
        min={new Date(0, 0, 0, 6, 0, 0)} // 6 AM
        max={new Date(0, 0, 0, 23, 0, 0)} // 11 PM
        messages={{
          next: 'Tiếp',
          previous: 'Trước',
          today: 'Hôm nay',
          month: 'Tháng',
          week: 'Tuần',
          day: 'Ngày',
          agenda: 'Lịch trình',
          date: 'Ngày',
          time: 'Thời gian',
          event: 'Sự kiện',
          noEventsInRange: 'Không có đặt sân nào trong khoảng thời gian này.',
          showMore: (total) => `+ Xem thêm ${total}`,
        }}
      />
    </Paper>
  );
};
