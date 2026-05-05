import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * A wrapper for Server Actions that enforces Admin authentication.
 * 
 * If the user is not logged in or is not an ADMIN, it throws an error and aborts.
 * If they are an admin, it passes the session into the inner function alongside original arguments.
 */
export function adminAction<T extends any[], R>(
  actionFn: (session: any, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user || session.user.role !== 'ADMIN') {
      throw new Error("Unauthorized: Admin privileges required");
    }
    
    return actionFn(session, ...args);
  };
}

/**
 * A wrapper for Server Actions that enforces User authentication.
 * 
 * If the user is not logged in, it throws an error and aborts.
 * If they are logged in, it passes the session into the inner function alongside original arguments.
 */
export function userAction<T extends any[], R>(
  actionFn: (session: any, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error("Unauthorized: Please sign in");
    }
    
    return actionFn(session, ...args);
  };
}
