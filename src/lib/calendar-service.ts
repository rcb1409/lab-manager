import { calendar } from './google-calendar';

export async function createCalendarEvent({
    googleCalendarId,
    eventName,
    userName,
    startTime,
    endTime,
}: {
    googleCalendarId: string;
    eventName: string;
    userName: string;
    startTime: Date;
    endTime: Date;
}) {
    try {
        const response = await calendar.events.insert({
            calendarId: googleCalendarId,
            requestBody: {
                summary: eventName,
                description: `Booked by: ${userName}`,
                start: {
                    dateTime: startTime.toISOString(),
                },
                end: {
                    dateTime: endTime.toISOString(),
                },
            },
        });

        return response.data.id;
    } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        throw new Error('Failed to create Calendar Event');
    }
}

export async function deleteCalendarEvent({
    googleCalendarId,
    eventId,
}: {
    googleCalendarId: string;
    eventId: string;
}) {
    try {
        await calendar.events.delete({
            calendarId: googleCalendarId,
            eventId: eventId,
        });
    } catch (error) {
        console.error('Error deleting Google Calendar event:', error);
        // We don't throw an error here so the DB can still delete gracefully even if Google Calendar fails
    }
}

export async function updateCalendarEvent({
    googleCalendarId,
    eventId,
    startTime,
    endTime,
}: {
    googleCalendarId: string;
    eventId: string;
    startTime: Date;
    endTime: Date;
}) {
    try {
        await calendar.events.patch({
            calendarId: googleCalendarId,
            eventId: eventId,
            requestBody: {
                start: { dateTime: startTime.toISOString() },
                end: { dateTime: endTime.toISOString() },
            },
        });
    } catch (error) {
        console.error('Error updating Google Calendar event:', error);
        throw new Error('Failed to update Calendar Event');
    }
}

export async function checkCalendarAvailability(
    googleCalendarId: string,
    startTime: Date,
    endTime: Date
): Promise<boolean> {
    try {
        const response = await calendar.events.list({
            calendarId: googleCalendarId,
            timeMin: startTime.toISOString(),
            timeMax: endTime.toISOString(),
            singleEvents: true,
        });
        
        // If items are returned, there's a collision
        return response.data.items ? response.data.items.length > 0 : false;
    } catch (error) {
        console.error('Error checking calendar availability:', error);
        return false;
    }
}

export async function createEquipmentCalender(equipmentName: string) {
    try {
        const response = await calendar.calendars.insert({
            requestBody: {
                summary: `Lab Equipment: ${equipmentName}`,
                timeZone: 'America/New_York'
            }
        });

        const newCalendarId = response.data.id;
        if (!newCalendarId) return null;

        await calendar.acl.insert({
            calendarId: newCalendarId,
            requestBody: {
                role: 'reader',
                scope: {
                    type: 'default'
                }
            }
        });

        // Share the calendar with the admin account
        await calendar.acl.insert({
            calendarId: newCalendarId,
            requestBody: {
                role: 'owner',
                scope: {
                    type: 'user',
                    value: 'mse.workflows@gmail.com'
                }
            }
        });

        return newCalendarId;
    }
    catch (error) {
        console.error('Error creating Google Calendar for equipment')
    }
    return null;
}

export async function deleteEquipmentCalendar(calendarId: string) {
    try {
        await calendar.calendars.delete({
            calendarId: calendarId
        });
    } catch (error) {
        console.error('Error deleting Google Calendar for equipment:', error);
    }
}