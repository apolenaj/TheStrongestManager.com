import { Alert } from "@/design-system";

type AuthNoticeProps = {
  area: string;
};

/**
 * Honest notice until authentication is implemented.
 * Does not fake a logged-in athlete experience.
 */
export function AuthNotice({ area }: AuthNoticeProps) {
  return (
    <Alert
      tone="info"
      title="Authentication not connected yet"
      className="mb-8"
    >
      {area} is a structural shell only. No athlete data is stored or displayed.
      Accounts and access control will ship in a later prompt.
    </Alert>
  );
}
