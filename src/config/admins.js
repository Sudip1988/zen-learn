// Emails with admin privileges — can approve invitations from the app
export const ADMIN_EMAILS = ["sudip88.net@gmail.com"];

export const isAdmin = (email) => ADMIN_EMAILS.includes(email?.toLowerCase());
