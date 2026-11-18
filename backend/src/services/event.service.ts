import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, ValidationError } from '../utils/errors';

export class EventService {
  /**
   * Get all published events for a college.
   */
static async getEvents(collegeId: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
      e.id,
      e.title,
      e.description,
      e.category,
      e.venue,
      e.start_time,
      e.end_time,
      e.banner_url,
      e.organizer_name,
      e.status
    FROM events e
    WHERE e.college_id = ?
      AND e.status IN ('UPCOMING', 'ONGOING', 'COMPLETED')
    ORDER BY e.start_time ASC`,
    [collegeId]
  );

  return rows;
}


  /**
   * Get a single event with registration status for a user.
   */
  static async getEventById(eventId: string, userId: string) {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        e.id, e.title, e.description, e.category, e.venue,
        e.start_time, e.end_time, e.banner_url, e.organizer_name, e.status,
        er.id AS registration_id,
        er.registration_date,
        er.attendance_status
       FROM events e
       LEFT JOIN event_registrations er ON er.event_id = e.id AND er.user_id = ?
       WHERE e.id = ?`,
      [userId, eventId]
    );
    if (!rows.length) throw new NotFoundError('Event not found');
    return rows[0];
  }

  /**
   * Register student for an event.
   */
  static async registerForEvent(eventId: string, userId: string) {
    // Check event exists and is UPCOMING or ONGOING
    const [events] = await pool.query<RowDataPacket[]>(
      `SELECT id, status FROM events WHERE id = ?`,
      [eventId]
    );
    if (!events.length) throw new NotFoundError('Event not found');
    if (!['UPCOMING', 'ONGOING'].includes(events[0].status)) {
      throw new ValidationError('Registration is closed for this event');
    }

    // Check duplicate
    const [existing] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?`,
      [eventId, userId]
    );
    if (existing.length) throw new ValidationError('You have already registered for this event');

    const regId = uuidv4();
    await pool.query(
      `INSERT INTO event_registrations (id, event_id, user_id, registration_date, attendance_status)
       VALUES (?, ?, ?, NOW(), 'REGISTERED')`,
      [regId, eventId, userId]
    );
    return { id: regId, status: 'REGISTERED', message: 'Successfully registered for event' };
  }
}
